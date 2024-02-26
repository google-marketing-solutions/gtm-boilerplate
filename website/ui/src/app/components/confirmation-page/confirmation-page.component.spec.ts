/**
 * @fileoverview unit tests for the ConfirmationPageComponent.
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

import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BasketService} from 'src/app/services/basket.service';
import {EcommerceEventsService} from 'src/app/services/ecommerce-events.service';
import {ProductsService} from 'src/app/services/products.service';
import {ConfirmationPageComponent} from './confirmation-page.component';

describe('ConfirmationPageComponent', () => {
  let component: ConfirmationPageComponent;
  let fixture: ComponentFixture<ConfirmationPageComponent>;
  let mockBasketService: jasmine.SpyObj<BasketService>;
  let mockEcommerceEventsService: jasmine.SpyObj<EcommerceEventsService>;
  let mockProductsService: jasmine.SpyObj<ProductsService>;

  beforeEach(async () => {
    // Create mock services with spies
    mockBasketService = jasmine.createSpyObj('BasketService', [
      'clearBasketCookie',
      'isBasketEmpty',
      'calculateTotalBasketPrice',
    ]);
    mockEcommerceEventsService = jasmine.createSpyObj(
      'EcommerceEventsService',
      ['sendPurchaseEvent'],
    );
    mockProductsService = jasmine.createSpyObj('ProductsService', [
      'getProductVariantPriceAsCurrency',
    ]);

    mockBasketService.isBasketEmpty.and.returnValue(false);

    await TestBed.configureTestingModule({
      declarations: [ConfirmationPageComponent],
      providers: [
        {provide: BasketService, useValue: mockBasketService},
        {provide: EcommerceEventsService, useValue: mockEcommerceEventsService},
        {provide: ProductsService, useValue: mockProductsService},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
