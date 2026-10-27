# Google Tag Gateway (GTG) Readiness & Endpoint Validator

A lightweight, zero-dependency Python CLI utility for web developers, CDN engineers, and measurement specialists to pre-assess and validate **Google Tag Gateway (GTG)** first-party tag deployments across Cloudflare, Akamai, Fastly, Amazon CloudFront, Imperva, and custom reverse proxies.

---

## Key Capabilities

1. **Automated 3-Endpoint GTG Health Probe** ([Help Center Answer 17141867](https://support.google.com/analytics/answer/17141867)):
   - **Script Loader (`/<1p-path>/gtag/js?id=<TAG_ID>` or `/gtm.js?id=GTM-XXXX`)**: Verifies `HTTP 200 OK` and checks for Single-Page Application (SPA) `<!DOCTYPE html>` fallback responses or redirect loops that cause `SyntaxError: Unexpected token '<'` in browsers.
   - **Geolocation Header Forwarding (`/<1p-path>/?validate_geo=healthy`)**: Verifies `HTTP 200 OK` returning `ok` to confirm edge geolocation headers are forwarded accurately.
   - **Measurement Collection (`/<1p-path>/g/collect`)**: Verifies `HTTP 200` / `204` response status and checks response headers to ensure edge caching is bypassed on measurement hits.

2. **Edge CDN, Tag Management System (TMS) & Tag ID Discovery**:
   - Detects active edge CDN headers (`Cloudflare`, `Akamai`, `Fastly`, `Amazon CloudFront`, `Imperva`) and Tag Managers (`Google Tag Manager`, `Direct gtag.js`, `Adobe Launch / Tags`, `Tealium iQ`, `Segment`).
   - Extracts on-page Google Tag IDs (`GTM-`, `AW-`, `G-`, `DC-`, `GT-`) and identifies active first-party GTG loader paths.
   - Checks custom `dataLayer` queue parameters (`&l=`) and `Content-Security-Policy` (`CSP`) headers against Google Ads regional conversion redirect requirements ([Official CSP Guide](https://developers.google.com/tag-platform/security/guides/csp)).

3. **Offline `.har` Network Capture Inspector**:
   - Audits exported Chrome DevTools `.har` files (captured with **Preserve log** enabled) to summarize first-party vs. third-party tag script loads and `/g/collect` / `pagead/1p-conversion` requests.

---

## Requirements

- **Python 3.9+** (uses Python standard library only — zero third-party `pip` packages required).

---

## Quick Start

### 1. Pre-Assess a Domain (CDN, TMS, CSP & Tag Discovery)

```bash
python3 gtg_validator.py --url https://www.example.com
```

### 2. Validate a Staged or Live First-Party GTG Path Across All 3 Endpoints

```bash
python3 gtg_validator.py \
  --url https://www.example.com \
  --gtg-path metrics \
  --tag-id GTM-XXXXXXX
```

### 3. Inspect a Chrome DevTools `.har` File

```bash
python3 gtg_validator.py \
  --url https://www.example.com \
  --har ./checkout_capture.har
```

### 4. Run Unit Tests

```bash
python3 -m unittest discover -v
```

---

## Official Documentation References

- [Set up Google tag gateway for advertisers using a CDN](https://support.google.com/analytics/answer/17141867)
- [Google tag gateway for advertisers overview](https://support.google.com/tagmanager/answer/12002338)
- [Set up Google tag gateway with Adobe Launch (Acronym extension)](https://support.google.com/tagmanager/answer/17231523)
- [Use Google Tag Manager and gtag.js with a Content Security Policy (CSP)](https://developers.google.com/tag-platform/security/guides/csp)

---

## Disclaimers

**This is not an officially supported Google product.**

Copyright 2026 Google LLC. Licensed under the [Apache License, Version 2.0](../../LICENSE).
