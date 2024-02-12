/**
 * @fileoverview a service for managing the user's consent with GTM.
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

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, Optional} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {BehaviorSubject} from 'rxjs';
import {Consent, ConsentStatus, ConsentUpdate} from '../models/consent';

/**
 * A service for managing the user's consent with GTM.
 */
@Injectable({
  providedIn: 'root',
})
export class ConsentService {
  // Set the default consent to denied
  private currentConsent: Consent = {
    'ad_storage': ConsentStatus.DENIED,
    'ad_user_data': ConsentStatus.DENIED,
    'ad_personalization': ConsentStatus.DENIED,
    'analytics_storage': ConsentStatus.DENIED,
  };
  private cookieName = 'consent';
  private cookieExpiryDays = 365;

  // The gtag is hard coded in the index.html, so it should always be present
  gtag!: Function;
  // Need to send the consent signal first, so this allows others to subscribe
  isInitialized = new BehaviorSubject<boolean>(false);
  hasConsentCookie = false;

  constructor(
    private cookieService: CookieService,
    @Inject(DOCUMENT) private document: Document,
    @Optional() @Inject('gtag') private injectedGtag?: Function,
  ) {
    this.initialize();
  }

  /**
   * Set the service up to be ready for use.
   * Set the initial consent to denied, check to see if the cookie has been set
   * with the user's preferences, and if so send an update.
   */
  private initialize(): void {
    if (!this.injectedGtag) {
      this.getGtagFromPage();
    } else {
      this.gtag = this.injectedGtag;
    }
    this.updateGtagConsent(ConsentUpdate.DEFAULT);
    this.getConsentFromCookie();
    if (this.hasConsentCookie === true) {
      this.updateGtagConsent(ConsentUpdate.UPDATE);
    }
    this.isInitialized.next(true);
  }

  /**
   * Get the current consent
   */
  getCurrentConsent(): Consent {
    return this.currentConsent;
  }

  /**
   * Set the current consent status, and ensure cookie and tagging are updated.
   * @param consent the new consent
   */
  setCurrentConsent(consent: Consent): void {
    this.currentConsent = consent;
    this.updateGtagConsent(ConsentUpdate.UPDATE);
    this.setConsentCookie();
  }

  /**
   * Pull the gTag function from the page and set the service attribute.
   */
  private getGtagFromPage(): void {
    const defaultView = this.document.defaultView;
    if (defaultView != null && 'gtag' in defaultView) {
      this.gtag = defaultView.gtag as Function;
    }
  }

  /**
   * Update the consent settings in Google Tag Manager.
   * @param consentUpdate: the type of consent update to apply, e.g. default
   */
  private updateGtagConsent(consentUpdate: ConsentUpdate): void {
    if (this.gtag() === undefined) {
      this.gtag('consent', consentUpdate, this.currentConsent);
    } else {
      console.error('gtag has not been assigned.');
    }
  }

  /**
   * Check the cookie to see if the consent has been set previously.
   */
  private getConsentFromCookie(): void {
    const consentCookie = this.cookieService.get(this.cookieName);
    if (consentCookie === '') {
      this.hasConsentCookie = false;
    } else {
      this.hasConsentCookie = true;
      const consent: Consent = JSON.parse(consentCookie);
      console.log('You have a cookie set with these preferences:');
      console.log(consent);
      this.currentConsent = consent;
    }
  }

  /**
   * Store the consent of the user in a cookie.
   */
  private setConsentCookie(): void {
    const expiryDate = new Date();
    expiryDate.setTime(
      expiryDate.getTime() + this.cookieExpiryDays * 24 * 60 * 60 * 1000,
    );
    this.cookieService.set(
      this.cookieName,
      JSON.stringify(this.currentConsent),
      expiryDate,
    );
  }
}
