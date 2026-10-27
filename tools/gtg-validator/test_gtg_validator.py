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
"""Unit tests for gtg_validator."""

import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

import gtg_validator


class GtgValidatorTest(unittest.TestCase):
    """Tests CDN detection, HTML tag parsing, SPA fallback traps, CSP checks, and endpoint probing."""

    def test_detect_cdn_from_headers(self):
        self.assertEqual(
            gtg_validator.detect_cdn_from_headers({"CF-Ray": "8a1b2c-DEN"}),
            "Cloudflare",
        )
        self.assertEqual(
            gtg_validator.detect_cdn_from_headers({"X-Akamai-Transformed": "9 - 0"}),
            "Akamai",
        )
        self.assertEqual(
            gtg_validator.detect_cdn_from_headers({"X-Fastly-Request-ID": "abc"}),
            "Fastly",
        )
        self.assertEqual(
            gtg_validator.detect_cdn_from_headers({"X-Amz-Cf-Id": "xyz"}),
            "Amazon CloudFront",
        )
        self.assertEqual(
            gtg_validator.detect_cdn_from_headers({"X-Iinfo": "12-34"}),
            "Imperva (Incapsula)",
        )
        self.assertEqual(
            gtg_validator.detect_cdn_from_headers({"Server": "nginx"}),
            "Unknown / Direct Origin",
        )

    def test_analyze_html_for_tags_and_tms(self):
        sample_html = """
        <html>
          <head>
            <script src="https://assets.adobedtm.com/launch-EN123.min.js"></script>
            <script src="https://www.example.com/metrics/gtag/js?id=AW-123456789&l=customLayer"></script>
            <script>
              gtag('config', 'G-ABC1234567');
              gtag('config', 'DC-9876543');
            </script>
          </head>
        </html>
        """
        res = gtg_validator.analyze_html_for_tags_and_tms(sample_html)
        self.assertIn("Adobe Launch (Tags)", res["detected_tms"])
        self.assertEqual(res["google_tags"]["AW"], ["AW-123456789"])
        self.assertEqual(res["google_tags"]["G"], ["G-ABC1234567"])
        self.assertEqual(res["google_tags"]["DC"], ["DC-9876543"])
        self.assertEqual(res["custom_datalayer_queues"], ["customLayer"])
        self.assertEqual(
            res["first_party_gtg_path"],
            "https://www.example.com/metrics/gtag/js?id=AW-123456789",
        )

    def test_is_html_fallback_response(self):
        self.assertTrue(
            gtg_validator.is_html_fallback_response("<!DOCTYPE html><html><body>SPA</body></html>")
        )
        self.assertFalse(
            gtg_validator.is_html_fallback_response("// Copyright 2026 Google Inc. (function(){})()")
        )

    def test_evaluate_csp_header(self):
        strict_csp = "default-src 'self'; connect-src 'self'; img-src 'self'"
        eval_res = gtg_validator.evaluate_csp_header(strict_csp)
        self.assertTrue(eval_res["present"])
        self.assertEqual(len(eval_res["warnings"]), 2)

        permissive_csp = "default-src 'self' https://*.google.com https://*.google.co.uk"
        eval_ok = gtg_validator.evaluate_csp_header(permissive_csp)
        self.assertEqual(len(eval_ok["warnings"]), 0)

    def test_parse_har_file(self):
        sample_har = {
            "log": {
                "entries": [
                    {
                        "request": {"url": "https://www.example.com/metrics/gtag/js?id=G-123456"},
                        "response": {"status": 200},
                    },
                    {
                        "request": {"url": "https://www.example.com/metrics/g/collect?v=2&tid=G-123456"},
                        "response": {"status": 204},
                    },
                ]
            }
        }
        with tempfile.NamedTemporaryFile("w", suffix=".har", delete=False) as tmp:
            json.dump(sample_har, tmp)
            tmp_path = tmp.name

        har_summary = gtg_validator.parse_har_file(tmp_path)
        Path(tmp_path).unlink(missing_ok=True)
        self.assertEqual(len(har_summary["gtag_loaders"]), 1)
        self.assertEqual(len(har_summary["first_party_hits"]), 1)

    @mock.patch("urllib.request.urlopen")
    def test_probe_gtg_endpoints(self, mock_urlopen):
        mock_resp = mock.MagicMock()
        mock_resp.status = 200
        mock_resp.headers = {"Cache-Control": "no-store"}
        mock_resp.read.return_value = b"ok"
        mock_resp.__enter__.return_value = mock_resp
        mock_urlopen.return_value = mock_resp

        res = gtg_validator.probe_gtg_endpoints(
            "https://www.example.com", "metrics", "GTM-ABC1234"
        )
        self.assertIsNotNone(res)
        self.assertEqual(
            res["1_script_loader"]["url"],
            "https://www.example.com/metrics/gtm.js?id=GTM-ABC1234",
        )
        self.assertTrue(res["2_validate_geo_healthy"]["geo_healthy_ok"])


if __name__ == "__main__":
    unittest.main()
