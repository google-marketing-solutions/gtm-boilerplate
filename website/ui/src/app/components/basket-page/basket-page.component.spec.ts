/**
 * @fileoverview unit tests for the BasketPageComponent.
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
import {BasketService} from 'src/app/services/basket.service';
import {EcommerceEventsService} from 'src/app/services/ecommerce-events.service';
import {ProductsService} from 'src/app/services/products.service';
import {BasketPageComponent} from './basket-page.component';

describe('BasketPageComponent', () => {
  let component: BasketPageComponent;
  let mockBasketService: jasmine.SpyObj<BasketService>;
  let mockEcommerceEventsService: jasmine.SpyObj<EcommerceEventsService>;
  let mockProductsService: jasmine.SpyObj<ProductsService>;

  beforeEach(async () => {
    // Create mock services with spies
    mockBasketService = jasmine.createSpyObj('BasketService', [
      'getBasket',
      'updateBasket',
      'calculateTotalBasketPrice',
    ]);
    mockEcommerceEventsService = jasmine.createSpyObj(
      'EcommerceEventsService',
      ['sendViewCartEvent', 'sendAddToCartEvent', 'sendRemoveFromCartEvent'],
    );
    mockProductsService = jasmine.createSpyObj('ProductsService', ['products']);

    await TestBed.configureTestingModule({
      declarations: [BasketPageComponent],
      providers: [
        {provide: BasketService, useValue: mockBasketService},
        {provide: EcommerceEventsService, useValue: mockEcommerceEventsService},
        {provide: ProductsService, useValue: mockProductsService},
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    const fixture = TestBed.createComponent(BasketPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sendViewCartEvent()', () => {
    it('should send the view cart event with basket and total price', () => {
      const mockBasket = {};
      const mockTotalPrice = 100;

      mockBasketService.getBasket.and.returnValue(mockBasket);
      mockBasketService.calculateTotalBasketPrice.and.returnValue(
        mockTotalPrice,
      );

      component.sendViewCartEvent();

      expect(mockEcommerceEventsService.sendViewCartEvent).toHaveBeenCalledWith(
        mockBasket,
        mockTotalPrice,
      );
    });

    it('should not send the event if the basket is empty', () => {
      mockBasketService.getBasket.and.returnValue(undefined);

      component.sendViewCartEvent();

      expect(
        mockEcommerceEventsService.sendViewCartEvent,
      ).not.toHaveBeenCalled();
    });
  });
});
