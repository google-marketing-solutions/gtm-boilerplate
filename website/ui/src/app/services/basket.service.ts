/**
 * @fileoverview a service for managing the user's basket.
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

import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';
import {Subject} from 'rxjs';
import {environment} from '../../environments/environment';
import {
  Basket,
  BasketProduct,
  BasketProductCookie,
  Product,
  ProductVariant,
} from '../models/products';
import {ProductsService} from './products.service';

/**
 * Service for managing the user's basket.
 */
@Injectable({
  providedIn: 'root',
})
export class BasketService {
  basket?: Basket;
  private addToCartSubject = new Subject<boolean>();
  private cookieName = 'basket-cookie';
  private cookieExpiryDays = 365;

  constructor(
    private cookieService: CookieService,
    private router: Router,
    private productsService: ProductsService,
  ) {
    this.refreshBasketFromCookie();
  }

  /**
   * Get the basket.
   */
  getBasket(): Basket | undefined {
    this.refreshBasketFromCookie();
    return this.basket;
  }

  /**
   * Refresh the basket contents from the cookie.
   */
  private refreshBasketFromCookie(): void {
    this.basket = this.getBasketFromCookie();
  }

  /**
   * Call this to trigger the add to cart event has been fired.
   */
  emitAddToCartEvent(): void {
    this.addToCartSubject.next(true);
  }

  /**
   * Returns an Observable that emits events when an item is added to the cart.
   * Subscribers to this stream can react accordingly to update the cart.
   *
   * @return An Observable that emits true when an item is added to the cart.
   */
  onAddToCartEvent() {
    return this.addToCartSubject.asObservable();
  }

  /**
   * Update the contents of the basket.
   * @param product the product to update the basket with.
   * @param productVariant the variant of the product being added.
   * @param changeQuantity the change in quantity to the product in the basket.
   *   Defaults to +1
   */
  updateBasket(
    product: Product,
    productVariant: ProductVariant,
    changeQuantity = 1,
  ): void {
    let basketProduct: BasketProduct;
    const basket = this.getBasketFromCookie();

    if (!basket.hasOwnProperty(productVariant.sku)) {
      basketProduct = {
        product,
        productVariant,
        quantity: changeQuantity,
      };
      basket[productVariant.sku] = basketProduct;
    } else {
      basket[productVariant.sku].quantity += changeQuantity;
    }

    // Remove the item from the basket if the quantity hits 0 or less.
    if (basket[productVariant.sku].quantity <= 0) {
      delete basket[productVariant.sku];
    }

    this.basket = basket;
    this.setBasketInCookie(basket);
  }

  /**
   * Buy a product with one-click. Add to the basket and submit order.
   * @param product the product to buy
   * @param productVariant the variant of the product being purchased.
   */
  buyWithOneClick(product: Product, productVariant: ProductVariant): void {
    this.updateBasket(product, productVariant, 1);
    this.router.navigate(['/thank-you']);
  }

  /**
   * Clear the contents of the basket.
   */
  clearBasket(): void {
    this.basket = {};
    this.clearBasketCookie();
  }

  /**
   * Delete the cookie that contains the basket contents.
   */
  clearBasketCookie(): void {
    this.cookieService.delete(this.cookieName);
  }

  /**
   * Set the contents of the basket in the cookie.
   */
  private setBasketInCookie(basket: Basket): void {
    const cookieProducts: BasketProductCookie[] =
      this.parseBasketToCookie(basket);
    const expiryDate = new Date();
    expiryDate.setTime(
      expiryDate.getTime() + this.cookieExpiryDays * 24 * 60 * 60 * 1000
    );
    this.cookieService.set(
      this.cookieName,
      JSON.stringify(cookieProducts)
    );
  }

  /**
   * Change the contents of the basket into the format stored in the cookie.
   * @param basket the basket to store in the cookie.
   * @return an array of BasketProductCookies
   */
  private parseBasketToCookie(basket: Basket): BasketProductCookie[] {
    const cookieProducts: BasketProductCookie[] = [];
    for (const basketProduct of Object.values(basket)) {
      cookieProducts.push({
        productId: basketProduct.product.id,
        productVariantSku: basketProduct.productVariant.sku,
        quantity: basketProduct.quantity,
      });
    }
    return cookieProducts;
  }

  /**
   * Change the contents of the basket cookie into a Basket object.
   * @param cookieProducts the array of products stored in the cookie.
   * @return the basket object with the contents from the cookie.
   */
  private parseCookieToBasket(cookieProducts: BasketProductCookie[]): Basket {
    const basket: Basket = {};
    for (const cookieProduct of cookieProducts) {
      const product = this.productsService.products[cookieProduct.productId];
      const basketProduct: BasketProduct = {
        product,
        productVariant: product.variants[cookieProduct.productVariantSku],
        quantity: cookieProduct.quantity,
      };
      basket[cookieProduct.productVariantSku] = basketProduct;
    }
    return basket;
  }

  /**
   * Get the basket contents from the cookie.
   * @return the basket.
   */
  private getBasketFromCookie(): Basket {
    const basketJson = this.cookieService.get(this.cookieName);
    if (basketJson == null || basketJson === '') {
      return {};
    } else {
      try {
        return this.parseCookieToBasket(JSON.parse(basketJson));
      }
      catch (error) {
        console.error('Error parsing cookie to a basket: ', error);
        return {};
      }
    }
  }

  /**
   * Check to see if the basket is empty.
   * @return true if the basket is empty, else false
   */
  isBasketEmpty(): boolean {
    if (this.basket != null) {
      return Object.keys(this.basket).length === 0;
    }
    return true;
  }

  /**
   * Calculate the basket product price (the price * quantity).
   * @param basketProduct the basket product.
   * @param formatAsCurrency set true if you require a currency formatted
   *   string (e.g. $1,000.00), else false will return a number (e.g. 1000)
   * @return Either the basket product price as a number or a string.
   */
  calculateBasketProductPrice(
    basketProduct: BasketProduct,
    formatAsCurrency = true,
  ): string | number {
    const total = basketProduct.quantity * basketProduct.productVariant.price;
    if (formatAsCurrency === false) {
      return total;
    }
    return new Intl.NumberFormat(environment.localCode, {
      style: 'currency',
      currency: environment.currency,
    }).format(total);
  }

  /**
   * Calculate the total basket price.
   * @param formatAsCurrency set true if you require a currency formatted
   *   string (e.g. $1,000.00), else false will return a number (e.g. 1000)
   * @return Either the total basket price as a number or a string.
   */
  calculateTotalBasketPrice(formatAsCurrency = true): string | number {
    let total = 0;
    if (this.basket){
      for (const basketProduct of Object.values(this.basket)) {
        total += this.calculateBasketProductPrice(basketProduct, false) as number;
      }
    }
    if (formatAsCurrency === false) {
      return total;
    }
    return new Intl.NumberFormat(environment.localCode, {
      style: 'currency',
      currency: environment.currency,
    }).format(total);
  }
}
