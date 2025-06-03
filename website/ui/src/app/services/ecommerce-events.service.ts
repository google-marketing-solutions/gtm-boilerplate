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

import { Injectable } from "@angular/core";
import { GoogleTagManagerService } from "angular-google-tag-manager";
import { js_beautify } from "js-beautify";
import { environment } from "src/environments/environment";
import {
  AddToCart,
  EcommerceEvent,
  EcommerceEventName,
  Item,
  Purchase,
  BeginCheckout,
  ViewItem,
  ViewPromotion,
  SelectPromotion,
  AddShippingInfo,
  AddPaymentInfo,
} from "../models/ecommerce-events";
import { Basket, Product, ProductVariant, Products } from "../models/products";
import { ProductsService } from "./products.service";
import { isNgTemplate } from "@angular/compiler";

/**
 * Service for sending ecommerce events to Google Tag Manager.
 */
@Injectable({
  providedIn: "root",
})
export class EcommerceEventsService {
  events: string[] = [];

  constructor(
    private gtmService: GoogleTagManagerService,
    private productService: ProductsService
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
   * Generate a select_item event.
   * @param product The product that was selected.
   * @param productVariant The variant of the product that was selected.
   * @return A select_item ecommerce event.
   */

  private getSelectItemEvent(
    product: Product,
    productVariant: ProductVariant
  ): EcommerceEvent {
    const event: EcommerceEvent = {
      event: EcommerceEventName.SELECT_ITEM,
      ecommerce: {
        items: [this.getItem(product, productVariant)],
      } as ViewItem,
    };
    this.logEvent(event);
    return event;
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
          basketProduct.quantity
        )
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
    quantity = 1
  ): Item {
    const item: Item = {
      item_id: productVariant.sku,
      item_name: product.name,
      price: productVariant.price,
      quantity,
      item_variant: productVariant.name,
      item_brand: product.item_brand,
      item_category: product.item_category,
      item_category2: product.item_category2,
      item_category3: product.item_category3,
      item_category4: product.item_category4,
      item_category5: product.item_category5,
      item_color: productVariant.item_color,
      item_availability: product.item_availability,
      item_material_type: product.item_material_type,
      item_list_id: product.item_list_id,
      item_list_name: product.item_list_name,
      location_id: "loc_" + product.id.toUpperCase().substring(0, 3),
    };

    if (
      this.productService.activePromotionContext &&
      this.productService.activePromotionContext.productId === product.id
    ) {
      item.promotion_id =
        this.productService.activePromotionContext.promotion_id;
      item.promotion_name =
        this.productService.activePromotionContext.promotion_name;
      item.creative_name =
        this.productService.activePromotionContext.creative_name;
      item.creative_slot =
        this.productService.activePromotionContext.creative_slot;
    }

    return item;
  }

  /**
   * For the given product return as an Item in ecommerce datalayer schema for promotions.
   * This includes promotion-specific parameters.
   * @param product The product being promoted.
   * @param productVariant The variant of the product being promoted.
   * @param promotionId The ID of the promotion.
   * @param promotionName The name of the promotion.
   * @param creativeName The name of the creative.
   * @param creativeSlot The slot of the creative.
   * @returns An ecommerce Item for the promotion.
   */
  private getPromotionItem(
    product: Product,
    productVariant: ProductVariant,
    promotionId: string,
    promotionName: string,
    creativeName: string,
    creativeSlot: string
  ): Item {
    return {
      item_id: productVariant.sku,
      item_name: product.name,
      price: productVariant.price,
      quantity: 1,
      item_variant: productVariant.name,
      item_brand: product.item_brand,
      item_category: product.item_category,
      item_category2: product.item_category2,
      item_category3: product.item_category3,
      item_category4: product.item_category4,
      item_category5: product.item_category5,
      item_color: productVariant.item_color,
      item_availability: product.item_availability,
      item_material_type: product.item_material_type,
      promotion_id: promotionId,
      promotion_name: promotionName,
      creative_name: creativeName,
      creative_slot: creativeSlot,
    };
  }

  /**
   * Output the event to the console.
   * @param event the event to output
   */
  private logEvent(event: EcommerceEvent): void {
    console.log("Generated ecommerce event:", event);
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
    productVariant: ProductVariant
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
    quantity = 1
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
    quantity = 1
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
   * Generate a begin_checkout event.
   * @param basket the basket containing the products.
   * @param value the total value of the basket.
   * @return a view_cart ecommerce event.
   */
  private getBeginCheckoutEvent(basket: Basket, value: number): EcommerceEvent {
    const event: EcommerceEvent = {
      event: EcommerceEventName.BEGIN_CHECKOUT,
      ecommerce: {
        currency: environment.currency,
        value,
        items: this.getItemsFromBasket(basket),
      } as BeginCheckout,
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
    shippingTier?: string,
    paymentType?: string
  ): EcommerceEvent {
    const event: EcommerceEvent = {
      event: EcommerceEventName.PURCHASE,
      ecommerce: {
        currency: environment.currency,
        value,
        items: this.getItemsFromBasket(basket),
        transaction_id,
        shipping_tier: shippingTier,
        payment_type: paymentType,
      } as Purchase,
    };
    this.logEvent(event);
    return event;
  }

  /**
   * Generate a view_promotion event.
   * @param product The product being promoted.
   * @param productVariant The variant of the product being promoted.
   * @param promotionId The ID of the promotion.
   * @param promotionName The name of the promotion.
   * @param creativeName The name of the creative.
   * @param creativeSlot The slot of the creative.
   * @returns A view_promotion ecommerce event.
   */
  private getViewPromotionEvent(
    product: Product,
    productVariant: ProductVariant,
    promotionId: string,
    promotionName: string,
    creativeName: string,
    creativeSlot: string
  ): EcommerceEvent {
    const event: EcommerceEvent = {
      event: EcommerceEventName.VIEW_PROMOTION,
      ecommerce: {
        items: [
          this.getPromotionItem(
            product,
            productVariant,
            promotionId,
            promotionName,
            creativeName,
            creativeSlot
          ),
        ],
      } as ViewPromotion,
    };
    this.logEvent(event);
    return event;
  }

  /**
   * Generate a select_promotion event.
   * @param product The product being promoted.
   * @param productVariant The variant of the product being promoted.
   * @param promotionId The ID of the promotion.
   * @param promotionName The name of the promotion.
   * @param creativeName The name of the creative.
   * @param creativeSlot The slot of the creative.
   * @returns A select_promotion ecommerce event.
   */
  private getSelectPromotionEvent(
    product: Product,
    productVariant: ProductVariant,
    promotionId: string,
    promotionName: string,
    creativeName: string,
    creativeSlot: string
  ): EcommerceEvent {
    const event: EcommerceEvent = {
      event: EcommerceEventName.SELECT_PROMOTION,
      ecommerce: {
        items: [
          this.getPromotionItem(
            product,
            productVariant,
            promotionId,
            promotionName,
            creativeName,
            creativeSlot
          ),
        ],
      } as SelectPromotion,
    };
    this.logEvent(event);
    return event;
  }

  /**
   * Generate an add_shipping_info event.
   * @param basket The current basket.
   * @param value The total value of the basket.
   * @param shippingTier The selected shipping tier.
   * @returns An add_shipping_info ecommerce event.
   */
  private getAddShippingInfoEvent(
    basket: Basket,
    value: number,
    shippingTier: string
  ): EcommerceEvent {
    const event: EcommerceEvent = {
      event: EcommerceEventName.ADD_SHIPPING_INFO,
      ecommerce: {
        currency: environment.currency,
        value,
        items: this.getItemsFromBasket(basket),
        shipping_tier: shippingTier,
      } as AddShippingInfo,
    };
    this.logEvent(event);
    return event;
  }

  /**
   * Generate an add_payment_info event.
   * @param basket The current basket.
   * @param value The total value of the basket.
   * @param paymentType The selected payment type.
   * @returns An add_payment_info ecommerce event.
   */
  private getAddPaymentInfoEvent(
    basket: Basket,
    value: number,
    paymentType: string
  ): EcommerceEvent {
    const event: EcommerceEvent = {
      event: EcommerceEventName.ADD_PAYMENT_INFO,
      ecommerce: {
        currency: environment.currency,
        value,
        items: this.getItemsFromBasket(basket),
        payment_type: paymentType,
      } as AddPaymentInfo,
    };
    this.logEvent(event);
    return event;
  }

  /**
   * Send the view_item_list event to GTM.
   * @param products the products to include.
   */
  sendViewItemListEvent(products: Products): void {
    this.gtmService.pushTag({ ecommerce: null });
    const event = this.getViewItemListEvent(products);
    this.gtmService.pushTag(event);
    this.events.unshift(this.formatEcommerceEventAsString(event));
  }

  /**
   * Send the select_item event to GTM.
   * @param product The product that was selected.
   * @param productVariant The variant of the product that was selected.
   */
  sendSelectItemEvent(product: Product, productVariant: ProductVariant): void {
    this.gtmService.pushTag({ ecommerce: null });
    const event = this.getSelectItemEvent(product, productVariant);
    this.gtmService.pushTag(event);
    this.events.unshift(this.formatEcommerceEventAsString(event));
  }

  /**
   * Send the view_item event to GTM.
   * @param product the product to include.
   * @param productVariant the variant of the product to use.
   */
  sendViewItemEvent(product: Product, productVariant: ProductVariant): void {
    this.gtmService.pushTag({ ecommerce: null });
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
    quantity = 1
  ): void {
    this.gtmService.pushTag({ ecommerce: null });
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
    quantity: number
  ): void {
    this.gtmService.pushTag({ ecommerce: null });
    const event = this.getRemoveFromCartEvent(
      product,
      productVariant,
      quantity
    );
    this.gtmService.pushTag(event);
    this.events.unshift(this.formatEcommerceEventAsString(event));
  }

  /**
   * Send the view_cart event to GTM.
   * @param basket the basket containing the products.
   * @param value the total value of the basket.
   */
  sendBeginCheckoutEvent(basket: Basket, value: number): void {
    this.gtmService.pushTag({ ecommerce: null });
    const event = this.getBeginCheckoutEvent(basket, value);
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
    shippingTier?: string,
    paymentType?: string
  ): void {
    this.gtmService.pushTag({ ecommerce: null });
    const event = this.getPurchaseEvent(
      basket,
      value,
      transaction_id,
      shippingTier,
      paymentType
    );
    this.gtmService.pushTag(event);
    this.events.unshift(this.formatEcommerceEventAsString(event));
  }

  /**
   * Send the view_promotion event to GTM.
   * @param product The product being promoted.
   * @param productVariant The variant of the product being promoted.
   * @param promotionId The ID of the promotion.
   * @param promotionName The name of the promotion.
   * @param creativeName The name of the creative.
   * @param creativeSlot The slot of the creative.
   */
  sendViewPromotionEvent(
    product: Product,
    productVariant: ProductVariant,
    promotionId: string,
    promotionName: string,
    creativeName: string,
    creativeSlot: string
  ): void {
    this.gtmService.pushTag({ ecommerce: null });
    const event = this.getViewPromotionEvent(
      product,
      productVariant,
      promotionId,
      promotionName,
      creativeName,
      creativeSlot
    );
    this.gtmService.pushTag(event);
    this.events.unshift(this.formatEcommerceEventAsString(event));
  }

  /**
   * Send the select_promotion event to GTM.
   * @param product The product being promoted.
   * @param productVariant The variant of the product being promoted.
   * @param promotionId The ID of the promotion.
   * @param promotionName The name of the promotion.
   * @param creativeName The name of the creative.
   * @param creativeSlot The slot of the creative.
   */
  sendSelectPromotionEvent(
    product: Product,
    productVariant: ProductVariant,
    promotionId: string,
    promotionName: string,
    creativeName: string,
    creativeSlot: string
  ): void {
    this.productService.setPromotionContext(
      product.id,
      promotionId,
      promotionName,
      creativeName,
      creativeSlot
    );
    this.gtmService.pushTag({ ecommerce: null });
    const event = this.getSelectPromotionEvent(
      product,
      productVariant,
      promotionId,
      promotionName,
      creativeName,
      creativeSlot
    );
    this.gtmService.pushTag(event);
    this.events.unshift(this.formatEcommerceEventAsString(event));
  }

  /**
   * Send the add_shipping_info event to GTM.
   * @param basket The current basket.
   * @param value The total value of the basket.
   * @param shippingTier The selected shipping tier.
   */
  sendAddShippingInfoEvent(
    basket: Basket,
    value: number,
    shippingTier: string
  ): void {
    this.gtmService.pushTag({ ecommerce: null });
    const event = this.getAddShippingInfoEvent(basket, value, shippingTier);
    this.gtmService.pushTag(event);
    this.events.unshift(this.formatEcommerceEventAsString(event));
  }

  /**
   * Send the add_payment_info event to GTM.
   * @param basket The current basket.
   * @param value The total value of the basket.
   * @param paymentType The selected payment type.
   */
  sendAddPaymentInfoEvent(
    basket: Basket,
    value: number,
    paymentType: string
  ): void {
    this.gtmService.pushTag({ ecommerce: null });
    const event = this.getAddPaymentInfoEvent(basket, value, paymentType);
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
      brace_style: "expand" as "expand",
    };
    return js_beautify(eventJson, options);
  }
}
