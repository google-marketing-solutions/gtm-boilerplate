/**
 * @fileoverview models for working with Ecommerce events.
 * Google Analytics has support for ecommerce events. Each of these events need
 * to be configured with their own schemas for each event. The schemas can be
 * found here
 * {@link https://developers.google.com/analytics/devguides/collection/ga4/reference/events}.
 * This document provides models that describe those objects.
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

/**
 * The base class for the Ecommerce Objects.
 * All ecommerce events contains an ecommerce object. This is the base class
 * for that object.
 */
export interface EcommerceObject {
  items: Item[];
}

/**
 * Enums for each of the ecommerce events that are configured.
 */
export enum EcommerceEventName {
  VIEW_ITEM_LIST = 'view_item_list',
  VIEW_ITEM = 'view_item',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  VIEW_CART = 'view_cart',
  PURCHASE = 'purchase',
}

/**
 * The base class for Ecommerce Events.
 */
export interface EcommerceEvent {
  event: EcommerceEventName;
  ecommerce: EcommerceObject;
}

/**
 * An ecommerce item, see:
 * {@link https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#view_item_item}
 */
export interface Item {
  item_id: string;
  item_name: string;
  affiliation?: string;
  coupon?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: number;
  quantity?: number;
}

/**
 * An ecommerce view_item_list event, see:
 * {@link https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#view_item_list}
 */
export interface ViewItemList extends EcommerceObject {
  item_list_id?: string;
  item_list_name?: string;
}

/**
 * An ecommerce view_item event, see:
 * {@link https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#view_item}
 */
export interface ViewItem extends EcommerceObject {
  currency: string;
  value: number;
}

/**
 * An ecommerce add_to_cart event, see:
 * {@link https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#add_to_cart}
 */
export interface AddToCart extends EcommerceObject {
  currency: string;
  value: number;
}

/**
 * An ecommerce remove_from_cart event, see:
 * {@link https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#remove_from_cart}
 */
export interface RemoveFromCart extends EcommerceEvent {
  currency: string;
  value: number;
}

/**
 * An ecommerce view_cart event, see:
 * {@link https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#view_cart}
 */
export interface ViewCart extends EcommerceObject {
  currency: string;
  value: number;
}

/**
 * An ecommerce purchase event, see:
 * {@link https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtm#purchase}
 */
export interface Purchase extends EcommerceObject {
  currency: string;
  value: number;
  transaction_id: string;
  coupon?: string;
  shipping?: number;
  tax?: number;
}
