/**
 * @fileoverview this is the component for the basket page of the app.
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
import {Product, ProductVariant} from 'src/app/models/products';
import {BasketService} from 'src/app/services/basket.service';
import {EcommerceEventsService} from 'src/app/services/ecommerce-events.service';
import {ProductsService} from 'src/app/services/products.service';

/**
 * Basket page component.
 */
@Component({
  selector: 'app-basket-page',
  templateUrl: './basket-page.component.html',
  styleUrls: ['./basket-page.component.css'],
})
export class BasketPageComponent implements OnInit {
  selectedShippingOption: string = '';
  selectedPaymentOption: string = '';

  constructor(
    public basketService: BasketService,
    public productsService: ProductsService,
    private ecommerceEventsService: EcommerceEventsService
  ) {}

  ngOnInit(): void {
    this.sendBeginCheckoutEvent();
  }

  /**
   * Sends the 'begin_checkout' event to Google Tag Manager, including current
   * basket contents.
   */
  sendBeginCheckoutEvent(): void {
    const basket = this.basketService.getBasket();
    if (basket) {
      this.ecommerceEventsService.sendBeginCheckoutEvent(
        basket,
        this.basketService.calculateTotalBasketPrice(false) as number
      );
    }
  }

  /**
   * Update basket contents & sends appropriate events to Google Tag Manager.
   * @param id The ID of the product to update.
   * @param productVariant The specific variant of the product.
   * @param changeQuantity The number of items to add (positive) or remove
   * (negative).
   */
  updateBasket(
    id: string,
    productVariant: ProductVariant,
    changeQuantity: number
  ): void {
    if (changeQuantity === 0) {
      return;
    }
    const product: Product = this.productsService.products[id];
    this.basketService.updateBasket(product, productVariant, changeQuantity);
    if (changeQuantity > 0) {
      this.ecommerceEventsService.sendAddToCartEvent(
        product,
        productVariant,
        changeQuantity
      );
    } else {
      this.ecommerceEventsService.sendRemoveFromCartEvent(
        product,
        productVariant,
        Math.abs(changeQuantity)
      );
    }
  }

  /**
   * Handles the change event for shipping options and sends add_shipping_info.
   * @param event The change event from the radio button.
   */
  onShippingOptionChange(event: Event): void {
    this.selectedShippingOption = (event.target as HTMLInputElement).value;
    const basket = this.basketService.getBasket();
    if (basket) {
      this.ecommerceEventsService.sendAddShippingInfoEvent(
        basket,
        this.basketService.calculateTotalBasketPrice(false) as number,
        this.selectedShippingOption
      );
    }
  }

  /**
   * Handles the change event for payment options and sends add_payment_info.
   * @param event The change event from the radio button.
   */
  onPaymentOptionChange(event: Event): void {
    this.selectedPaymentOption = (event.target as HTMLInputElement).value;
    const basket = this.basketService.getBasket();
    if (basket) {
      this.ecommerceEventsService.sendAddPaymentInfoEvent(
        basket,
        this.basketService.calculateTotalBasketPrice(false) as number,
        this.selectedPaymentOption
      );
    }
  }
}
