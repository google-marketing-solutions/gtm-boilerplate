#!/usr/bin/env python3
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Google Tag Gateway (GTG) Readiness & 3-Endpoint Validator.

Author: Ryan McDaniel (ryanmcdaniel@google.com)

A zero-dependency CLI utility that inspects public web domains and optional
Chrome DevTools .har captures to validate Google Tag Gateway (GTG) first-party
routing across Cloudflare, Akamai, Fastly, Amazon CloudFront, Imperva, and
custom reverse proxies.

Official references:
- https://support.google.com/analytics/answer/17141867
- https://support.google.com/tagmanager/answer/12002338
- https://support.google.com/tagmanager/answer/17231523
- https://developers.google.com/tag-platform/security/guides/csp
"""

import argparse
import json
import re
import ssl
import urllib.request
from pathlib import Path
from typing import Any, Dict, List, Optional


USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
)


def detect_cdn_from_headers(headers: Dict[str, str]) -> str:
    """Identifies the edge CDN/WAF from HTTP response headers."""
    hdrs = {k.lower(): v for k, v in headers.items()}
    srv = hdrs.get("server", "").lower()
    sc = hdrs.get("set-cookie", "").lower()

    if "cf-ray" in hdrs or "cloudflare" in srv:
        return "Cloudflare"
    if any(k.startswith("x-akamai") for k in hdrs) or "akamaighost" in srv:
        return "Akamai"
    if (
        "x-iinfo" in hdrs
        or "imperva" in hdrs.get("x-cdn", "").lower()
        or "incap_ses" in sc
    ):
        return "Imperva (Incapsula)"
    if "x-fastly-request-id" in hdrs or "fastly" in hdrs.get("via", "").lower():
        return "Fastly"
    if "x-amz-cf-id" in hdrs or "cloudfront" in hdrs.get("via", "").lower():
        return "Amazon CloudFront"
    return "Unknown / Direct Origin"


def analyze_html_for_tags_and_tms(html: str) -> Dict[str, Any]:
    """Extracts Google Tag IDs, TMS libraries, custom dataLayer names, and 1P GTG paths."""
    google_tags = {
        "GTM": sorted(set(re.findall(r"\bGTM-[A-Z0-9]{5,10}\b", html))),
        "AW": sorted(set(re.findall(r"\bAW-[0-9]{6,12}\b", html))),
        "G": sorted(set(re.findall(r"\bG-[A-Z0-9]{6,12}\b", html))),
        "DC": sorted(set(re.findall(r"\bDC-[0-9]{5,10}\b", html))),
        "GT": sorted(set(re.findall(r"\bGT-[A-Z0-9]{5,12}\b", html))),
    }

    detected_tms: List[str] = []
    if "assets.adobedtm.com" in html or "_satellite" in html:
        detected_tms.append("Adobe Launch (Tags)")
    if "tags.tiqcdn.com" in html or "utag.js" in html:
        detected_tms.append("Tealium iQ")
    if "cdn.segment.com" in html or "analytics.load(" in html:
        detected_tms.append("Segment Analytics.js")
    if google_tags["GTM"] or "googletagmanager.com/gtm.js" in html:
        detected_tms.append("Google Tag Manager (Web)")
    if "googletagmanager.com/gtag/js" in html:
        detected_tms.append("Direct gtag.js")

    custom_datalayer_queues = sorted(
        set(re.findall(r"[?&]l=([a-zA-Z0-9_$]+)", html)) - {"dataLayer"}
    )

    first_party_gtg_loader = None
    fp_match = re.search(
        r'https?://[^"\'\s>]+/([a-zA-Z0-9_-]+)/(?:gtag/js|gtm\.js)\?id=(?:AW|G|DC|GT|GTM)-[A-Z0-9-]+',
        html,
    )
    if fp_match and "googletagmanager.com" not in fp_match.group(0):
        first_party_gtg_loader = fp_match.group(0)

    return {
        "google_tags": google_tags,
        "detected_tms": detected_tms,
        "custom_datalayer_queues": custom_datalayer_queues,
        "first_party_gtg_path": first_party_gtg_loader,
    }


def evaluate_csp_header(csp_value: str) -> Dict[str, Any]:
    """Checks whether a Content-Security-Policy header may block Google Ads regional redirects."""
    if not csp_value:
        return {"present": False, "warnings": []}

    warnings: List[str] = []
    lower_csp = csp_value.lower()
    if "connect-src" in lower_csp and "google." not in lower_csp and "*" not in lower_csp:
        warnings.append(
            "connect-src is restricted and may block regional Google conversion endpoints "
            "(see https://developers.google.com/tag-platform/security/guides/csp)."
        )
    if "img-src" in lower_csp and "google." not in lower_csp and "*" not in lower_csp:
        warnings.append(
            "img-src is restricted and may block HTTP 302 regional conversion pixels "
            "(see https://developers.google.com/tag-platform/security/guides/csp)."
        )
    return {"present": True, "raw_excerpt": csp_value[:240], "warnings": warnings}


def is_html_fallback_response(body_sample: str) -> bool:
    """Detects when an origin server returns an SPA index.html fallback instead of a JS tag bundle."""
    cleaned = (body_sample or "").strip().lower()
    return cleaned.startswith("<!doctype html") or "<html" in cleaned[:300]


def scan_url(raw_url: str, timeout: int = 8) -> Dict[str, Any]:
    """Performs an HTTP GET inspection of a target webpage URL."""
    url = raw_url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    info: Dict[str, Any] = {
        "input_url": raw_url,
        "final_url": url,
        "http_status": None,
        "detected_cdn": "Unknown / Direct Origin",
        "edge_headers": {},
        "csp_evaluation": {"present": False, "warnings": []},
        "detected_tms": [],
        "google_tags": {"GTM": [], "AW": [], "G": [], "DC": [], "GT": []},
        "custom_datalayer_queues": [],
        "first_party_gtg_path": None,
        "error": None,
    }

    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            info["http_status"] = resp.status
            info["final_url"] = resp.geturl()
            hdrs = {k.lower(): v for k, v in resp.headers.items()}
            for key in (
                "server",
                "cf-ray",
                "x-akamai-transformed",
                "x-akamai-request-id",
                "x-iinfo",
                "x-cdn",
                "x-fastly-request-id",
                "x-amz-cf-id",
                "via",
                "content-security-policy",
                "content-security-policy-report-only",
            ):
                if key in hdrs:
                    info["edge_headers"][key] = hdrs[key][:240]

            info["detected_cdn"] = detect_cdn_from_headers(hdrs)
            info["csp_evaluation"] = evaluate_csp_header(
                hdrs.get("content-security-policy", "")
            )

            html = resp.read(350_000).decode("utf-8", errors="ignore")
            html_analysis = analyze_html_for_tags_and_tms(html)
            info.update(html_analysis)
    except Exception as exc:  # pylint: disable=broad-except
        info["error"] = str(exc)

    return info


def probe_gtg_endpoints(
    base_url: str, gtg_path: str, tag_id: str = "", timeout: int = 8
) -> Optional[Dict[str, Any]]:
    """Probes the 3 live GTG endpoints documented in Help Center Answer 17141867:
    1. Script Loader (/<1p-path>/gtag/js?id=<TAG_ID> or /gtm.js?id=<TAG_ID>)
    2. Geolocation Health Check (/<1p-path>/?validate_geo=healthy -> 'ok')
    3. Measurement Collection Endpoint (/<1p-path>/g/collect)
    """
    if not gtg_path:
        return None
    clean_base = base_url.strip().rstrip("/")
    if not clean_base.startswith("http"):
        clean_base = "https://" + clean_base
    clean_path = gtg_path.strip("/")

    loader_file = "gtm.js" if (tag_id or "").startswith("GTM-") else "gtag/js"
    loader_url = (
        f"{clean_base}/{clean_path}/{loader_file}?id={tag_id}"
        if tag_id
        else f"{clean_base}/{clean_path}/{loader_file}"
    )
    geo_url = f"{clean_base}/{clean_path}/?validate_geo=healthy"
    collect_url = f"{clean_base}/{clean_path}/g/collect?v=2&tid={tag_id or 'G-TEST'}"

    ctx = ssl.create_default_context()
    results: Dict[str, Any] = {}

    for label, target in (
        ("1_script_loader", loader_url),
        ("2_validate_geo_healthy", geo_url),
        ("3_g_collect", collect_url),
    ):
        try:
            req = urllib.request.Request(target, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
                body_preview = (
                    resp.read(2048).decode("utf-8", errors="ignore").strip()
                )
                html_trap = is_html_fallback_response(body_preview)
                cache_control = resp.headers.get("Cache-Control", "")
                entry: Dict[str, Any] = {
                    "url": target,
                    "http_status": resp.status,
                    "is_html_fallback_trap": html_trap,
                    "cache_control": cache_control,
                    "body_sample": body_preview[:120],
                }
                if label == "2_validate_geo_healthy":
                    entry["geo_healthy_ok"] = body_preview.lower() == "ok"
                results[label] = entry
        except Exception as exc:  # pylint: disable=broad-except
            results[label] = {"url": target, "error": str(exc)}

    return results


def parse_har_file(har_path: str) -> Dict[str, Any]:
    """Parses a Chrome DevTools .har file to summarize 1P vs. 3P tag and collection requests."""
    summary: Dict[str, Any] = {
        "gtag_loaders": [],
        "collect_hits": [],
        "first_party_hits": [],
    }
    path_obj = Path(har_path)
    if not path_obj.exists():
        summary["error"] = f"HAR file not found: {har_path}"
        return summary
    try:
        data = json.loads(path_obj.read_text(encoding="utf-8", errors="ignore"))
        for entry in data.get("log", {}).get("entries", []):
            req_url = entry.get("request", {}).get("url", "")
            status = entry.get("response", {}).get("status")
            if "gtag/js" in req_url or "gtm.js" in req_url:
                summary["gtag_loaders"].append(
                    {"url": req_url[:140], "status": status}
                )
            if "/g/collect" in req_url or "1p-conversion" in req_url:
                summary["collect_hits"].append(
                    {"url": req_url[:140], "status": status}
                )
                if (
                    "google-analytics.com" not in req_url
                    and "analytics.google.com" not in req_url
                    and "googletagmanager.com" not in req_url
                ):
                    summary["first_party_hits"].append(
                        {"url": req_url[:140], "status": status}
                    )
    except Exception as exc:  # pylint: disable=broad-except
        summary["error"] = str(exc)
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Google Tag Gateway (GTG) Readiness & 3-Endpoint Validator"
    )
    parser.add_argument(
        "--url",
        action="append",
        default=[],
        help="Target webpage URL(s) to inspect (can be specified multiple times).",
    )
    parser.add_argument(
        "--gtg-path",
        default="",
        help="Optional first-party GTG path (e.g., metrics) to probe across all 3 endpoints.",
    )
    parser.add_argument(
        "--tag-id",
        default="",
        help="Optional Google Tag ID (AW-..., DC-..., G-..., GTM-..., GT-...) to probe.",
    )
    parser.add_argument(
        "--har",
        default="",
        help="Optional path to a Chrome DevTools .har capture file.",
    )
    args = parser.parse_args()

    output = {
        "url_scans": [scan_url(u) for u in args.url],
        "gtg_3_endpoint_probes": [
            probe_gtg_endpoints(u, args.gtg_path, args.tag_id) for u in args.url
        ]
        if args.gtg_path
        else None,
        "har_telemetry": parse_har_file(args.har) if args.har else None,
    }
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
