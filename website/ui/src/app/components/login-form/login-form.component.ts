/**
 * @fileoverview this is the component for the login form.
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
import {FormControl, FormGroup} from '@angular/forms';
import {LoginService} from 'src/app/services/login.service';

/**
 * Login form component.
 */
@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css',
})
export class LoginFormComponent implements OnInit {
  showOverlay = false;
  userForm: FormGroup = new FormGroup({});;

  constructor(public loginService: LoginService) {}

  ngOnInit(): void {
    // Initialize form with user data (if available)
    this.userForm = new FormGroup({
      id: new FormControl(this.loginService.user.id || '1'),
      name: new FormControl(this.loginService.user.name || 'Jane Doe'),
      email: new FormControl(
        this.loginService.user.email || 'jane.doe@example.com',
      ),
    });
    this.loginService.setUserInDataLayer(this.loginService.user);
  }

  /**
   * Log the user in.
   */
  login(): void {
    this.loginService.logUserIn(this.userForm.value);
    this.showOverlay = false;
  }

  /**
   * Log the user out.
   */
  logout(): void {
    this.loginService.logUserOut();
  }

  /**
   * Toggle the login form.
   */
  toggleOverlay(): void {
    this.showOverlay = !this.showOverlay;
  }
}
