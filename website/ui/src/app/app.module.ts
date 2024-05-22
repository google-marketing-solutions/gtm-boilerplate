/**
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

import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {GoogleTagManagerModule} from 'angular-google-tag-manager';

import {environment} from 'src/environments/environment';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BasketPageComponent} from './components/basket-page/basket-page.component';
import {ConfirmationPageComponent} from './components/confirmation-page/confirmation-page.component';
import {CookieBannerComponent} from './components/cookie-banner/cookie-banner.component';
import {EventStreamComponent} from './components/event-stream/event-stream.component';
import {HomePageComponent} from './components/home-page/home-page.component';
import {LoginFormComponent} from './components/login-form/login-form.component';
import {ProductListComponent} from './components/product-list/product-list.component';
import {ProductPageComponent} from './components/product-page/product-page.component';
import {ProductsPageComponent} from './components/products-page/products-page.component';
import {TopBarComponent} from './components/top-bar/top-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    HomePageComponent,
    ProductsPageComponent,
    ProductListComponent,
    ProductPageComponent,
    BasketPageComponent,
    ConfirmationPageComponent,
    CookieBannerComponent,
    LoginFormComponent,
    EventStreamComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleTagManagerModule.forRoot({
      id: environment.gtmContainerId,
      gtm_resource_path: environment.gtmResourcePath,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
