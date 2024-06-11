/**
 * @fileoverview the routing for the application.
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

import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BasketPageComponent} from './components/basket-page/basket-page.component';
import {ConfirmationPageComponent} from './components/confirmation-page/confirmation-page.component';
import {HomePageComponent} from './components/home-page/home-page.component';
import {ProductPageComponent} from './components/product-page/product-page.component';
import {ProductsPageComponent} from './components/products-page/products-page.component';

const storeNameSuffix = '| Demo E-commerce Store';
const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: `Home ${storeNameSuffix}`,
  },
  {
    path: 'products',
    component: ProductsPageComponent,
    title: `Products ${storeNameSuffix}`,
  },
  {
    path: 'product/:id',
    component: ProductPageComponent,
    title: `Product ${storeNameSuffix}`,
  },
  {
    path: 'basket',
    component: BasketPageComponent,
    title: `Basket ${storeNameSuffix}`,
  },
  {
    path: 'thank-you',
    component: ConfirmationPageComponent,
    title: `Thank you ${storeNameSuffix}`,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
