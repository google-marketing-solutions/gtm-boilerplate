/**
 * @fileoverview models for working with products.
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
 * Represents a product to purchase from the store.
 * Each product can have one to many variants, see {@link ProductVariant}, which
 * have a unique sku.
 * The default variant which will take priority in the search results, and on
 * landing pages is defined by the default_variant attribute.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  default_variant: string; // the sku of the default variant
  variants: {[sku: string]: ProductVariant};
}

/**
 * Each product can have many variants. These can be different sizes, and/or
 * different colours for the product. Each variant should have a unique
 * identifier in the sku attribute.
 */
export interface ProductVariant {
  sku: string;
  name: string;
  display_name: string;
  size: string;
  image: string;
  price: number;
}

/**
 * An object for storing a range of products. The key represents the unique
 * product ID, allowing fast lookups.
 */
export interface Products {
  [id: string]: Product;
}

/**
 * For adding an item to the basket create a BasketProduct.
 * Each basket product contains the product, the variant desired and the
 * quantity wanted.
 */
export interface BasketProduct {
  product: Product;
  productVariant: ProductVariant;
  quantity: number;
}

/**
 * A BasketProductCookie is used to store the minimum amount of data required in
 * a cookie. So this is a simplified version of the {@link BasketProduct}.
 */
export interface BasketProductCookie {
  productId: string;
  productVariantSku: string;
  quantity: number;
}

/**
 * An object for storing a user's basket contents. The product variant sku is
 * used as a key for fast lookups and retrievals.
 */
export interface Basket {
  [sku: string]: BasketProduct;
}
