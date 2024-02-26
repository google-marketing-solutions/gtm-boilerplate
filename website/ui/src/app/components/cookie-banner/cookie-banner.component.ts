/**
 * @fileoverview this is the component for the cookie banner.
 *
 * Copyright 2024 Google LLC
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

import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {Consent, ConsentStatus} from 'src/app/models/consent';
import {ConsentService} from 'src/app/services/consent.service';

/**
 * Cookie Banner Component.
 */
@Component({
  selector: 'app-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.css',
})
export class CookieBannerComponent implements OnInit {
  showOverlay = false;
  consentForm!: FormGroup;

  constructor(
    private consentService: ConsentService,
    private fb: FormBuilder,
  ) {}

  /**
   * Show cookie consent if first time on site, else save preferences.
   */
  ngOnInit(): void {
    if (!this.consentService.hasConsentCookie) {
      this.showOverlay = true;
    }
    const transformedConsent = this.transformConsentForForm(
      this.consentService.getCurrentConsent(),
    );
    this.consentForm = this.fb.group(transformedConsent);
  }

  /**
   * Toggle the cookie banner overlay to show or be hidden.
   */
  toggleCookieBanner(): void {
    this.showOverlay = !this.showOverlay;
  }

  /**
   * Accept all the consent options and save the form.
   */
  acceptAll(): void {
    this.changeAllCheckBoxes(true);
    this.save();
  }

  /**
   * Deny all the consent options and save the form.
   */
  denyAll(): void {
    this.changeAllCheckBoxes(false);
    this.save();
  }

  /**
   * Change all the checkboxes in the form to either true of false.
   * @param state the state to change the checkboxes to
   */
  private changeAllCheckBoxes(state: boolean): void {
    for (const controlName in this.consentForm.controls) {
      if (this.consentForm.controls.hasOwnProperty(controlName)) {
        const control = this.consentForm.get(controlName);
        if (control instanceof FormControl) {
          control.setValue(state);
        }
      }
    }
  }

  /**
   * Transform the consent form from booleans to granted/denied.
   */
  private transformConsentFromForm(): Consent {
    return {
      'ad_storage':
        this.consentForm.value.ad_storage === true
          ? ConsentStatus.GRANTED
          : ConsentStatus.DENIED,
      'analytics_storage':
        this.consentForm.value.analytics_storage === true
          ? ConsentStatus.GRANTED
          : ConsentStatus.DENIED,
      'ad_user_data':
        this.consentForm.value.ad_user_data === true
          ? ConsentStatus.GRANTED
          : ConsentStatus.DENIED,
      'ad_personalization':
        this.consentForm.value.ad_personalization === true
          ? ConsentStatus.GRANTED
          : ConsentStatus.DENIED,
    };
  }

  /**
   * Transform the consent into booleans for use in the form.
   * @param consent the consent to transform.
   * @return An object resembling the consent but in boolean form, where
   *  granted is true, and denied is false.
   */
  private transformConsentForForm(consent: Consent): {} {
    return {
      ad_storage: consent.ad_storage === ConsentStatus.GRANTED,
      ad_user_data: consent.ad_user_data === ConsentStatus.GRANTED,
      analytics_storage: consent.analytics_storage === ConsentStatus.GRANTED,
      ad_personalization: consent.ad_personalization === ConsentStatus.GRANTED,
    };
  }

  /**
   * Save the output of the form, and update consent preferences.
   */
  save(): void {
    this.showOverlay = false;
    const newConsent: Consent = this.transformConsentFromForm();
    console.log('Your consent has been set as: ');
    console.log(newConsent);
    this.consentService.setCurrentConsent(newConsent);
  }
}
