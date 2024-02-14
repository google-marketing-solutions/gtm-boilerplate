/**
 * @fileoverview unit tests for the LoginFormComponent.
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

import {TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {User} from 'src/app/models/user';
import {LoginService} from 'src/app/services/login.service';
import {LoginFormComponent} from './login-form.component';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let mockLoginService: jasmine.SpyObj<LoginService>;
  const mockUserData = {
    id: '2',
    name: 'John Smith',
    email: 'john.smith@example.com',
  };

  beforeEach(async () => {
    mockLoginService = jasmine.createSpyObj('LoginService', [
      'logUserIn',
      'logUserOut',
      'setUserInDataLayer',
      'user',
    ]);
    mockLoginService.user = mockUserData;

    await TestBed.configureTestingModule({
      declarations: [LoginFormComponent],
      imports: [ReactiveFormsModule],
      providers: [{provide: LoginService, useValue: mockLoginService}],
    }).compileComponents();
  });

  beforeEach(() => {
    const fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should initialize form with user data from LoginService', () => {
      mockLoginService.user = mockUserData;
      expect(component.userForm.value).toEqual(mockUserData);
    });

    it('should call setUserInDataLayer on initialization', () => {
      expect(mockLoginService.setUserInDataLayer).toHaveBeenCalledWith(
        mockUserData,
      );
    });
  });

  describe('login()', () => {
    it('should call logUserIn with form values and close the overlay', () => {
      component.userForm.setValue({
        id: '3',
        name: 'Test User',
        email: 'test@example.com',
      });

      component.login();
      expect(mockLoginService.logUserIn).toHaveBeenCalledWith(
        component.userForm.value,
      );
      expect(component.showOverlay).toBeFalse();
    });
  });

  describe('logout()', () => {
    it('should call logUserOut', () => {
      component.logout();
      expect(mockLoginService.logUserOut).toHaveBeenCalled();
    });
  });

  describe('toggleOverlay()', () => {
    it('should toggle the value of showOverlay', () => {
      component.showOverlay = false;
      component.toggleOverlay();
      expect(component.showOverlay).toBeTrue();
      component.toggleOverlay();
      expect(component.showOverlay).toBeFalse();
    });
  });
});
