/**
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit, input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tag-settings',
  templateUrl: './tag-settings.component.html',
  styleUrl: './tag-settings.component.css'
})
export class TagSettingsComponent implements OnInit {
  sidebarCollapsed = input<boolean>(false);
  settingsForm!: FormGroup;
  showOverlay = false;
  isLocalStorageEnabled = true;
  currentImplementationLabel = '';

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.isLocalStorageEnabled = this.checkLocalStorage();
    this.initForm();
  }

  private checkLocalStorage(): boolean {
    try {
      localStorage.setItem('__test_ls__', '1');
      localStorage.removeItem('__test_ls__');
      return true;
    } catch (e) {
      return false;
    }
  }

  private setImplementationLabel(
    library: string,
    enableGtg: boolean,
    gtgType: string,
    stapeUseCustomLoader = false
  ): void {
    const libLabel = library === 'gtm' ? 'GTM' : 'Gtag';
    if (!enableGtg) {
      this.currentImplementationLabel = `${libLabel} | Standard`;
      return;
    }

    if (gtgType === 'server') {
      this.currentImplementationLabel = `${libLabel} | GTG via sGTM`;
    } else if (gtgType === 'cdn') {
      this.currentImplementationLabel = `${libLabel} | GTG via CDN`;
    } else if (gtgType === 'cdn-1click') {
      this.currentImplementationLabel = `${libLabel} | GTG via CDN (in UI)`;
    } else if (gtgType === 'stape') {
      this.currentImplementationLabel = stapeUseCustomLoader
        ? `${libLabel} | GTG via Stape (Custom Loader)`
        : `${libLabel} | GTG via Stape`;
    }
  }

  private initForm(): void {
    let storedTagType = 'gtm-default';
    let gtmContainerId = environment.gtmContainerId;
    let googleTagId = environment.googleTagId;

    if (this.isLocalStorageEnabled) {
      try {
        storedTagType = localStorage.getItem('tag-type') || 'gtm-default';
        gtmContainerId = localStorage.getItem('gtm-container-id') || environment.gtmContainerId;
        googleTagId = localStorage.getItem('google-tag-id') || environment.googleTagId;
      } catch (e) {
        this.isLocalStorageEnabled = false;
      }
    }

    let library = 'gtm';
    if (storedTagType.startsWith('gtag')) {
      library = 'gtag';
    } else {
      library = 'gtm';
    }

    // GTM:
    let gtmEnableGtg = false;
    let gtmGtgType = 'server';
    let gtmSgtmTagServingUrl = environment.sgtmTagServingUrl;
    let gtmCdnTagServingUrl = 'https://www.googletagmanager.com';
    let gtmStapeTagServingUrl = environment.stapeTagServingUrl;
    let gtmStapeUseCustomLoader = false;
    let gtmStapeHeadSnippet = '';
    let gtmStapeBodySnippet = '';

    // Gtag:
    let gtagEnableGtg = false;
    let gtagGtgType = 'server';
    let gtagSgtmTagServingUrl = environment.sgtmTagServingUrl;
    let gtagCdnTagServingUrl = 'https://www.googletagmanager.com';
    let gtagSgtmEndpointUrl = environment.sgtmEndpointUrl;

    if (this.isLocalStorageEnabled) {
      try {
        const loadBoolean = (key: string, defaultVal: boolean): boolean => {
          const val = localStorage.getItem(key);
          if (val === 'true') return true;
          if (val === 'false') return false;
          return defaultVal;
        };

        // Determine fallback values from previous tag-type if specific settings don't exist
        let prevGtmEnableGtg = false;
        let prevGtmGtgType = 'server';
        if (storedTagType.startsWith('gtm-gtg-')) {
          prevGtmEnableGtg = true;
          if (storedTagType.includes('via-stape')) {
            prevGtmGtgType = 'stape';
          } else if (storedTagType.endsWith('via-cdn')) {
            prevGtmGtgType = 'cdn';
            const hasCustomCdnCookie = localStorage.getItem('cdn-tag-serving-url') !== null;
            if (!hasCustomCdnCookie) {
              prevGtmGtgType = 'cdn-1click';
            }
          } else {
            prevGtmGtgType = 'server';
          }
        }

        gtmEnableGtg = loadBoolean('gtm-enable-gtg', prevGtmEnableGtg);
        gtmGtgType = localStorage.getItem('gtm-gtg-type') || prevGtmGtgType;

        gtmSgtmTagServingUrl = localStorage.getItem('gtm-sgtm-tag-serving-url')
          || (storedTagType.startsWith('gtm') ? localStorage.getItem('sgtm-tag-serving-url') : null)
          || environment.sgtmTagServingUrl;

        gtmCdnTagServingUrl = localStorage.getItem('gtm-cdn-tag-serving-url')
          || (storedTagType.startsWith('gtm') ? localStorage.getItem('cdn-tag-serving-url') : null)
          || 'https://www.googletagmanager.com';

        gtmStapeTagServingUrl = localStorage.getItem('gtm-stape-tag-serving-url')
          || environment.stapeTagServingUrl;

        gtmStapeUseCustomLoader = loadBoolean(
          'gtm-stape-use-custom-loader',
          storedTagType === 'gtm-gtg-via-stape-custom-loader'
        );
        gtmStapeHeadSnippet = localStorage.getItem('gtm-stape-head-snippet') || '';
        gtmStapeBodySnippet = localStorage.getItem('gtm-stape-body-snippet') || '';

        let prevGtagEnableGtg = false;
        let prevGtagGtgType = 'server';
        if (storedTagType.startsWith('gtag-gtg-')) {
          prevGtagEnableGtg = true;
          prevGtagGtgType = storedTagType.endsWith('via-cdn') ? 'cdn' : 'server';
          const hasCustomCdnCookie = localStorage.getItem('cdn-tag-serving-url') !== null;
          if (storedTagType.endsWith('via-cdn') && !hasCustomCdnCookie) {
            prevGtagGtgType = 'cdn-1click';
          }
        }

        gtagEnableGtg = loadBoolean('gtag-enable-gtg', prevGtagEnableGtg);
        gtagGtgType = localStorage.getItem('gtag-gtg-type') || prevGtagGtgType;

        gtagSgtmTagServingUrl = localStorage.getItem('gtag-sgtm-tag-serving-url')
          || (storedTagType.startsWith('gtag') ? localStorage.getItem('sgtm-tag-serving-url') : null)
          || environment.sgtmTagServingUrl;

        gtagCdnTagServingUrl = localStorage.getItem('gtag-cdn-tag-serving-url')
          || (storedTagType.startsWith('gtag') ? localStorage.getItem('cdn-tag-serving-url') : null)
          || 'https://www.googletagmanager.com';

        gtagSgtmEndpointUrl = localStorage.getItem('gtag-sgtm-endpoint-url')
          || localStorage.getItem('sgtm-endpoint-url')
          || environment.sgtmEndpointUrl;

      } catch (e) {
        this.isLocalStorageEnabled = false;
      }
    }

    const activeEnableGtg = library === 'gtag' ? gtagEnableGtg : gtmEnableGtg;
    const activeGtgType = library === 'gtag' ? gtagGtgType : gtmGtgType;
    this.setImplementationLabel(library, activeEnableGtg, activeGtgType, gtmStapeUseCustomLoader);

    this.settingsForm = this.fb.group({
      library: [library],
      gtmContainerId: [gtmContainerId],
      googleTagId: [googleTagId],

      gtmEnableGtg: [gtmEnableGtg],
      gtmGtgType: [gtmGtgType],
      gtmSgtmTagServingUrl: [gtmSgtmTagServingUrl],
      gtmCdnTagServingUrl: [gtmCdnTagServingUrl],
      gtmStapeTagServingUrl: [gtmStapeTagServingUrl],
      gtmStapeUseCustomLoader: [gtmStapeUseCustomLoader],
      gtmStapeHeadSnippet: [gtmStapeHeadSnippet],
      gtmStapeBodySnippet: [gtmStapeBodySnippet],

      gtagEnableGtg: [gtagEnableGtg],
      gtagGtgType: [gtagGtgType],
      gtagSgtmTagServingUrl: [gtagSgtmTagServingUrl],
      gtagCdnTagServingUrl: [gtagCdnTagServingUrl],
      gtagSgtmEndpointUrl: [gtagSgtmEndpointUrl]
    });
  }

  toggleSettings(): void {
    this.showOverlay = !this.showOverlay;
  }

  saveSettings(): void {
    const formValue = this.settingsForm.value;

    localStorage.setItem('gtm-container-id', formValue.gtmContainerId);
    localStorage.setItem('google-tag-id', formValue.googleTagId);

    // Save GTM settings
    localStorage.setItem('gtm-enable-gtg', String(formValue.gtmEnableGtg));
    localStorage.setItem('gtm-gtg-type', formValue.gtmGtgType);
    localStorage.setItem('gtm-sgtm-tag-serving-url', formValue.gtmSgtmTagServingUrl);
    localStorage.setItem('gtm-stape-tag-serving-url', formValue.gtmStapeTagServingUrl);
    localStorage.setItem('gtm-stape-use-custom-loader', String(formValue.gtmStapeUseCustomLoader));
    localStorage.setItem('gtm-stape-head-snippet', formValue.gtmStapeHeadSnippet || '');
    localStorage.setItem('gtm-stape-body-snippet', formValue.gtmStapeBodySnippet || '');
    if (formValue.gtmGtgType === 'cdn') {
      localStorage.setItem('gtm-cdn-tag-serving-url', formValue.gtmCdnTagServingUrl);
    } else {
      localStorage.removeItem('gtm-cdn-tag-serving-url');
    }

    // Save Gtag settings
    localStorage.setItem('gtag-enable-gtg', String(formValue.gtagEnableGtg));
    localStorage.setItem('gtag-gtg-type', formValue.gtagGtgType);
    localStorage.setItem('gtag-sgtm-tag-serving-url', formValue.gtagSgtmTagServingUrl);
    localStorage.setItem('gtag-sgtm-endpoint-url', formValue.gtagSgtmEndpointUrl);
    if (formValue.gtagGtgType === 'cdn') {
      localStorage.setItem('gtag-cdn-tag-serving-url', formValue.gtagCdnTagServingUrl);
    } else {
      localStorage.removeItem('gtag-cdn-tag-serving-url');
    }

    // Determine and save active `tag-type`
    let tagType = 'gtm-default';
    if (formValue.library === 'gtag') {
      if (formValue.gtagEnableGtg) {
        tagType = formValue.gtagGtgType.startsWith('cdn') ? 'gtag-gtg-via-cdn' : 'gtag-gtg-via-sgtm';
      } else {
        tagType = 'gtag-default';
      }
    } else {
      if (formValue.gtmEnableGtg) {
        if (formValue.gtmGtgType === 'stape') {
          tagType = formValue.gtmStapeUseCustomLoader
            ? 'gtm-gtg-via-stape-custom-loader'
            : 'gtm-gtg-via-stape';
        } else if (formValue.gtmGtgType.startsWith('cdn')) {
          tagType = 'gtm-gtg-via-cdn';
        } else {
          tagType = 'gtm-gtg-via-sgtm';
        }
      } else {
        tagType = 'gtm-default';
      }
    }
    localStorage.setItem('tag-type', tagType);

    // Clean up old shared keys
    localStorage.removeItem('sgtm-tag-serving-url');
    localStorage.removeItem('cdn-tag-serving-url');
    localStorage.removeItem('sgtm-endpoint-url');

    window.location.reload();
  }

  resetSettings(): void {
    localStorage.removeItem('tag-type');
    localStorage.removeItem('gtm-container-id');
    localStorage.removeItem('google-tag-id');

    localStorage.removeItem('gtm-enable-gtg');
    localStorage.removeItem('gtm-gtg-type');
    localStorage.removeItem('gtm-sgtm-tag-serving-url');
    localStorage.removeItem('gtm-cdn-tag-serving-url');
    localStorage.removeItem('gtm-stape-tag-serving-url');
    localStorage.removeItem('gtm-stape-use-custom-loader');
    localStorage.removeItem('gtm-stape-head-snippet');
    localStorage.removeItem('gtm-stape-body-snippet');

    localStorage.removeItem('gtag-enable-gtg');
    localStorage.removeItem('gtag-gtg-type');
    localStorage.removeItem('gtag-sgtm-tag-serving-url');
    localStorage.removeItem('gtag-cdn-tag-serving-url');
    localStorage.removeItem('gtag-sgtm-endpoint-url');

    localStorage.removeItem('sgtm-tag-serving-url');
    localStorage.removeItem('cdn-tag-serving-url');
    localStorage.removeItem('sgtm-endpoint-url');

    window.location.reload();
  }
}
