/**
 * @fileoverview unit tests for the ProductPageComponent.
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

import {ProductPageComponent} from './product-page.component';
import {BasketService} from 'src/app/services/basket.service';
import {EcommerceEventsService} from 'src/app/services/ecommerce-events.service';
import {ProductsService} from 'src/app/services/products.service';
import {Product, Products} from 'src/app/models/products';
import {RouterTestingModule} from '@angular/router/testing';

describe('ProductPageComponent', () => {
  let component: ProductPageComponent;
  let fixture: ComponentFixture<ProductPageComponent>;
  let mockBasketService: jasmine.SpyObj<BasketService>;
  let mockEcommerceEventsService: jasmine.SpyObj<EcommerceEventsService>;
  let mockProductsService: Partial<ProductsService>;
  let mockProducts: Products;
  let mockProduct: Product;

  beforeEach(async () => {
    mockBasketService = jasmine.createSpyObj(
      'BasketService',
      ['updateBasket',]
    );
    mockEcommerceEventsService = jasmine.createSpyObj(
      'EcommerceEventsService',
      ['sendViewItemEvent',]
    );

    mockProduct = {
      'id': '123',
      'name': 'test product',
      'description': `test description`,
      'default_variant': '123_green_m',
      'variants': {
        '123_green_m': {
          'sku': '123_m_green',
          'name': 'test#green#m',
          'display_name': 'Green',
          'price': 10,
          'size': 'M',
          'image': 'test-image.png',
        }
      }
    };

    mockProducts = {
      '123': mockProduct
    };

    mockProductsService = { 
      products: mockProducts
    };

    await TestBed.configureTestingModule({
      declarations: [ ProductPageComponent ],
      imports: [RouterTestingModule],
      providers: [
        { provide: BasketService, useValue: mockBasketService },
        { provide: EcommerceEventsService, useValue: mockEcommerceEventsService },
        { provide: ProductsService, useValue: mockProductsService },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
