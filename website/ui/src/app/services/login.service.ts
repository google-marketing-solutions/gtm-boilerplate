/**
 * @fileoverview A service to manage user login/logouts in the app.
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
import {Inject, Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {User} from '../models/user';

/**
 * A service to manage user login/logouts in the app.
 */
@Injectable({
  providedIn: 'root',
})
export class LoginService {
  isLoggedIn = false;
  user: User;

  private cookieName = 'login-cookie';
  private cookieExpiryDays = 365;
  private nullUser: User = {
    id: null,
    name: null,
    email: null,
  };
  // The datalayer is set in index.html so it is always present.
  // Using any as the content of the datalayer is externally managed by GTM.
  private dataLayer!: any[];

  constructor(
    private cookieService: CookieService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.user = this.getUserFromCookie();
    this.getDataLayerFromPage();
  }

  /**
   * Pull the datalayer from the page.
   */
  private getDataLayerFromPage(): void {
    const defaultView = this.document.defaultView;
    if (defaultView != null && 'dataLayer' in defaultView) {
      this.dataLayer = defaultView.dataLayer as any[];
    }
  }

  /**
   * Log in a user.
   * @param user the user to login
   */
  logUserIn(user: User): void {
    this.user = user;
    this.setUserInDataLayer(user);
    this.isLoggedIn = true;
    this.setUserInCookie();
  }

  /**
   * Set a user in the datalayer.
   * @param user the user to login.
   */
  setUserInDataLayer(user: User): void {
    if (user !== undefined) {
      this.dataLayer.push({
        user,
      });
    }
  }

  /**
   * Log out a user.
   */
  logUserOut(): void {
    this.isLoggedIn = false;
    this.cookieService.delete(this.cookieName);
    this.setUserInDataLayer(this.nullUser);
  }

  /**
   * Set the user in the cookie for persistence.
   */
  private setUserInCookie(): void {
    const expiryDate = new Date();
    expiryDate.setTime(
      expiryDate.getTime() + this.cookieExpiryDays * 24 * 60 * 60 * 1000,
    );
    this.cookieService.set(
      this.cookieName,
      JSON.stringify(this.user),
      expiryDate,
    );
  }

  /**
   * Get the user from the cookie.
   * @returns the user based on what's stored in the cookie
   */
  private getUserFromCookie(): User {
    const loginCookie = this.cookieService.get(this.cookieName);
    // Cookie has not been set - return defaults
    if (loginCookie === '') {
      return this.nullUser;
    } else {
      const user: User = JSON.parse(loginCookie);
      this.isLoggedIn = true;
      return user;
    }
  }
}
