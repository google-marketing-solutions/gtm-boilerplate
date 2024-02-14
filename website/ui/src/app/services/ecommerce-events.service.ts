/**
 * @fileoverview a service for managing the ecommerce events with GTM.
 * It creates the objects in the desired schema, and sends them to Google Tag
 * Manager.
 * See these docs for more details on the schema:
 * https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm
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
import {GoogleTagManagerService} from 'angular-google-tag-manager';
import {js_beautify} from 'js-beautify';
import {environment} from 'src/environments/environment';
import {
  AddToCart,
  EcommerceEvent,
  EcommerceEventName,
  Item,
  Purchase,
  ViewCart,
  ViewItem,
} from '../models/ecommerce-events';
import {Basket, Product, ProductVariant, Products} from '../models/products';
import {ProductsService} from './products.service';

/**
 * Service for sending ecommerce events to Google Tag Manager.
 */
@Injectable({
  providedIn: 'root',
})
export class EcommerceEventsService {
  events: string[] = [];

  constructor(
    private gtmService: GoogleTagManagerService,
    private productService: ProductsService,
  ) {}

  /**
   * For the given products return as Items in ecommerce datalayer schema.
   * @param products the products to format.
   * @return an array of Items for all of the products.
   */
  private getItems(products: Products): Item[] {
    const items: Item[] = [];
    for (const product of Object.values(products)) {
      const productVariant =
        this.productService.getDefaultProductVariant(product);
      items.push(this.getItem(product, productVariant));
    }
    return items;
  }

  /**
   * For the given basket return as Item in ecommerce datalayer schema.
   * @param basket the basket to get the items from.
   * @return an array of Items for all of the products in the basket.
   */
  private getItemsFromBasket(basket: Basket): Item[] {
    const items: Item[] = [];
    for (const basketProduct of Object.values(basket)) {
      items.push(
        this.getItem(
          basketProduct.product,
          basketProduct.productVariant,
          basketProduct.quantity,
        ),
      );
    }
    return items;
  }

  /**
   * For the given product return as an Item in ecommerce datalayer schema.
   * @param product the product to format.
   * @param productVariant the product variant to format.
   * @param quantity optionally provide the quantity to use.
   * @return an ecommerce Item for of the product.
   */
  private getItem(
    product: Product,
    productVariant: ProductVariant,
    quantity = 1,
  ): Item {
    return {
      item_id: productVariant.sku,
      item_name: product.name,
      price: productVariant.price,
      quantity,
      item_variant: productVariant.name,
    };
  }

  /**
   * Output the event to the console.
   * @param event the event to output
   */
  private logEvent(event: EcommerceEvent): void {
    console.log('Generated ecommerce event:', event);
  }

  /**
   * Generate a view_item_list event.
   * @param products the products to use in the items array.
   * @return a view_item_list ecommerce event.
   */
  private getViewItemListEvent(products: Products): EcommerceEvent {
    const event: EcommerceEvent = {
      event: EcommerceEventName.VIEW_ITEM_LIST,
      ecommerce: {
        items: this.getItems(products),
      },
    };
    this.logEvent(event);
    return event;
  }

  /**
   * Generate a view_item event.
   * @param product the product to use in the items array.
   * @param productVariant the variant of the product to use.
   * @return a view_item ecommerce event.
   */
  private getViewItemEvent(
    product: Product,
    productVariant: ProductVariant,
  ): EcommerceEvent {
    const event: EcommerceEvent = {
      event: EcommerceEventName.VIEW_ITEM,
      ecommerce: {
        currency: environment.currency,
        value: productVariant.price,
        items: [this.getItem(product, productVariant)],
      } as ViewItem,
    };
    this.logEvent(event);
    return event;
  }

  /**
   * Generate a add_to_cart event.
   * @param product the product to use in the items array.
   * @param productVariant the product variant being added.
   * @param quantity the quantity being added
   * @return an add_to_cart ecommerce event.
   */
  private getAddToCartEvent(
    product: Product,
    productVariant: ProductVariant,
    quantity = 1,
  ): EcommerceEvent {
    const event: EcommerceEvent = {
      event: EcommerceEventName.ADD_TO_CART,
      ecommerce: {
        currency: environment.currency,
        value: productVariant.price,
        items: [this.getItem(product, productVariant, quantity)],
      } as AddToCart,
    };
    this.logEvent(event);
    return event;
  }

  /**
   * Generate a remove_from_cart event.
   * @param product the product to use in the items array.
   * @param productVariant the product variant being added.
   * @param quantity the quantity being added
   * @return an add_to_cart ecommerce event.
   */
  private getRemoveFromCartEvent(
    product: Product,
    productVariant: ProductVariant,
    quantity = 1,
  ): EcommerceEvent {
    const event: EcommerceEvent = {
      event: EcommerceEventName.REMOVE_FROM_CART,
      ecommerce: {
        currency: environment.currency,
        value: productVariant.price,
        items: [this.getItem(product, productVariant, quantity)],
      } as AddToCart,
    };
    this.logEvent(event);
    return event;
  }

  /**
   * Generate a view_cart event.
   * @param basket the basket containing the products.
   * @param value the total value of the basket.
   * @return a view_cart ecommerce event.
   */
  private getViewCartEvent(basket: Basket, value: number): EcommerceEvent {
    const event: EcommerceEvent = {
      event: EcommerceEventName.VIEW_CART,
      ecommerce: {
        currency: environment.currency,
        value,
        items: this.getItemsFromBasket(basket),
      } as ViewCart,
    };
    this.logEvent(event);
    return event;
  }

  /**
   * Generate a purchase event.
   * @param basket the basket containing the products.
   * @param value the total value of the basket.
   * @param transaction_id the ID of the transaction.
   * @return a purchase ecommerce event.
   */
  private getPurchaseEvent(
    basket: Basket,
    value: number,
    transaction_id: string,
  ): EcommerceEvent {
    const event: EcommerceEvent = {
      event: EcommerceEventName.PURCHASE,
      ecommerce: {
        currency: environment.currency,
        value,
        items: this.getItemsFromBasket(basket),
        transaction_id,
      } as Purchase,
    };
    this.logEvent(event);
    return event;
  }

  /**
   * Send the view_item_list event to GTM.
   * @param products the products to include.
   */
  sendViewItemListEvent(products: Products): void {
    // clear previous ecommerce object
    this.gtmService.pushTag({ecommerce: null});
    const event = this.getViewItemListEvent(products);
    this.gtmService.pushTag(event);
    this.events.unshift(this.formatEcommerceEventAsString(event));
  }

  /**
   * Send the view_item event to GTM.
   * @param product the product to include.
   * @param productVariant the variant of the product to use.
   */
  sendViewItemEvent(product: Product, productVariant: ProductVariant): void {
    // clear previous ecommerce object
    this.gtmService.pushTag({ecommerce: null});
    const event = this.getViewItemEvent(product, productVariant);
    this.gtmService.pushTag(event);
    this.events.unshift(this.formatEcommerceEventAsString(event));
  }

  /**
   * Send the add_to_cart event to GTM.
   * @param product the products to include.
   * @param productVariant the product variant being added.
   * @param quantity the quantity being added.
   */
  sendAddToCartEvent(
    product: Product,
    productVariant: ProductVariant,
    quantity = 1,
  ): void {
    // clear previous ecommerce object
    this.gtmService.pushTag({ecommerce: null});
    const event = this.getAddToCartEvent(product, productVariant, quantity);
    this.gtmService.pushTag(event);
    this.events.unshift(this.formatEcommerceEventAsString(event));
  }

  /**
   * Send the remove_from_cart event to GTM.
   * @param product the products to include.
   * @param productVariant the product variant being removed.
   * @param quantity the quantity being removed. This should be positive, so 1
   *   if 1 item is being removed.
   */
  sendRemoveFromCartEvent(
    product: Product,
    productVariant: ProductVariant,
    quantity: number,
  ): void {
    // clear previous ecommerce object
    this.gtmService.pushTag({ecommerce: null});
    const event = this.getRemoveFromCartEvent(
      product,
      productVariant,
      quantity,
    );
    this.gtmService.pushTag(event);
    this.events.unshift(this.formatEcommerceEventAsString(event));
  }

  /**
   * Send the view_cart event to GTM.
   * @param basket the basket containing the products.
   * @param value the total value of the basket.
   */
  sendViewCartEvent(basket: Basket, value: number): void {
    // clear previous ecommerce object
    this.gtmService.pushTag({ecommerce: null});
    const event = this.getViewCartEvent(basket, value);
    this.gtmService.pushTag(event);
    this.events.unshift(this.formatEcommerceEventAsString(event));
  }

  /**
   * Send the purchase event to GTM.
   * @param basket the basket containing the products.
   * @param value the total value of the basket.
   * @param transaction_id the ID of the transaction.
   */
  sendPurchaseEvent(
    basket: Basket,
    value: number,
    transaction_id: string,
  ): void {
    // clear previous ecommerce object
    this.gtmService.pushTag({ecommerce: null});
    const event = this.getPurchaseEvent(basket, value, transaction_id);
    this.gtmService.pushTag(event);
    this.events.unshift(this.formatEcommerceEventAsString(event));
  }

  /**
   * Format a given EcommerceEvent as a string.
   * @param event the event to format.
   * @return the event as a string.
   */
  private formatEcommerceEventAsString(event: EcommerceEvent): string {
    const eventJson = JSON.stringify(event);
    const options = {
      indent_size: 2,
      space_in_empty_paren: true,
      brace_style: 'expand' as 'expand',
    };
    return js_beautify(eventJson, options);
  }
}
