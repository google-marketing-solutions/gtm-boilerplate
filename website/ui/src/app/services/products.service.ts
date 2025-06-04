/**
 * @fileoverview a service is used to manage all product aspects of the app.
 * In the real world this service might fetch the products from a backend, but
 * as this is a simple demo, the products are hardcoded here.
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
import {environment} from '../../environments/environment';
import {Product, ProductVariant, Products} from '../models/products';

/**
 * A service used to manage working with products within the application.
 */
@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  public activePromotionContext: {
    productId: string;
    promotion_id: string;
    promotion_name: string;
    creative_name: string;
    creative_slot: string;
  } | null = null;

  products: Products = {
    blazer: {
      id: 'blazer',
      name: 'Blazer',
      description: `This elegant blazer adds a bold pop of color to any
                      outfit. Classic button-up design offers timeless style.`,
      default_variant: 'blazer_red_m',
      item_brand: 'FashionCorp',
      item_category: 'Apparel',
      item_category2: 'Outerwear',
      item_category3: 'Jacket',
      item_category4: 'Blazer',
      item_category5: 'Women Apparel',
      item_availability: 'Limited Availability',
      item_material_type: 'Wool Blend',
      item_list_id: 'listing-123',
      item_list_name: 'Product listing page',
      review_rating: '4.6 out of 5',
      index: 1,
      variants: {
        blazer_red_m: {
          sku: 'blazer_red_m',
          name: 'blazer#red#m',
          display_name: 'Red',
          price: 150,
          size: 'M',
          image: 'blazer-red.png',
          item_color: 'Red',
        },
        blazer_green_m: {
          sku: 'blazer_green_m',
          name: 'blazer#green#m',
          display_name: 'Green',
          price: 180,
          size: 'M',
          image: 'blazer-green.png',
          item_color: 'Green',
        },
        blazer_brown_m: {
          sku: 'blazer_brown_m',
          name: 'blazer#brown#m',
          display_name: 'Brown',
          price: 155,
          size: 'M',
          image: 'blazer-brown.png',
          item_color: 'Brown',
        },
      },
    },
    tshirt: {
      id: 'tshirt',
      name: 'T-Shirt',
      description: `Brighten your wardrobe with this sunny yellow
                      short-sleeved t-shirt. Soft, breathable fabric for all-day
                      comfort.`,
      default_variant: 'tshirt_m',
      item_brand: 'ComfortWear',
      item_category: 'Apparel',
      item_category2: 'Tops',
      item_category3: 'T-Shirt',
      item_category4: 'Short Sleeve',
      item_category5: 'Adult',
      item_availability: 'Available Now',
      item_material_type: 'Cotton',
      item_list_id: 'shirts-123',
      item_list_name: 'Summer sale',
      review_rating: '3.2 out of 5',
      index: 2,
      variants: {
        tshirt_l: {
          sku: 'tshirt_l',
          name: 'tshirt#L',
          display_name: 'Large',
          price: 30,
          size: 'L',
          image: 't-shirt.jpg',
          item_color: 'Yellow',
        },
        tshirt_m: {
          sku: 'tshirt_m',
          name: 'tshirt#M',
          display_name: 'Medium',
          price: 30,
          size: 'M',
          image: 't-shirt.jpg',
          item_color: 'Yellow',
        },
        tshirt_s: {
          sku: 'tshirt_s',
          name: 'tshirt#S',
          display_name: 'Small',
          price: 30,
          size: 'S',
          image: 't-shirt.jpg',
          item_color: 'Yellow',
        },
      },
    },
    shoes: {
      id: 'shoes',
      name: 'Shoes',
      description: `These cheerful yellow lace-up shoes offer unbeatable
                      comfort and style. Perfect for casual outings or a pop of
                      color at work.`,
      default_variant: 'shoes_6',
      item_brand: 'StepRight',
      item_category: 'Footwear',
      item_category2: 'Casual Shoes',
      item_category3: 'Sneakers',
      item_category4: 'Yellow Shoes',
      item_category5: 'Unisex Footwear',
      item_availability: 'Online only',
      item_material_type: 'Synthetic',
      item_list_id: 'shoes-123',
      item_list_name: 'New arrivals',
      review_rating: '4.2 out of 5',
      index: 3,
      variants: {
        shoes_4: {
          sku: 'shoes_4',
          name: 'shoes#4',
          display_name: 'Size: 4',
          price: 80,
          size: '4',
          image: 'shoes.jpg',
          item_color: 'Black',
        },
        shoes_5: {
          sku: 'shoes_5',
          name: 'shoes#5',
          display_name: 'Size: 5',
          price: 80,
          size: '5',
          image: 'shoes.jpg',
          item_color: 'Gray',
        },
        shoes_6: {
          sku: 'shoes_6',
          name: 'shoes#6',
          display_name: 'Size: 6',
          price: 80,
          size: '6',
          image: 'shoes.jpg',
          item_color: 'Blue',
        },
        shoes_7: {
          sku: 'shoes_7',
          name: 'shoes#7',
          display_name: 'Size: 7',
          price: 80,
          size: '7',
          image: 'shoes.jpg',
          item_color: 'Yellow',
        },
        shoes_8: {
          sku: 'shoes_8',
          name: 'shoes#8',
          display_name: 'Size: 8',
          price: 80,
          size: '8',
          image: 'shoes.jpg',
          item_color: 'Black',
        },
      },
    },
  };

  /**
   * Get default product variant.
   * @param product the product to select the variant from.
   * @returns the default product variant.
   */
  getDefaultProductVariant(product: Product): ProductVariant {
    return product.variants[product.default_variant];
  }

  /**
   * Get the price for the product variant as a string formatted as a currency.
   * @param productVariant the product variant to get the price from
   * @returns the product price formatted as a currency, e.g. $1,000.00
   */
  getProductVariantPriceAsCurrency(productVariant?: ProductVariant): string {
    if (productVariant != null) {
      return this.formatNumberAsCurrency(productVariant.price);
    }
    return '';
  }

  /**
   * Get the price for the default product variant as a string formatted as a
   * currency.
   * @param product the product to get the price from
   * @returns the product price formatted as a currency, e.g. $1,000.00
   */
  getDefaultProductVariantPriceAsCurrency(product?: Product): string {
    if (product != null) {
      return this.formatNumberAsCurrency(
        this.getDefaultProductVariant(product).price
      );
    }
    return '';
  }

  /**
   * Set the active promotion context.
   * @param productId The ID of the product related to the promotion.
   * @param promotionId The ID of the promotion.
   * @param promotionName The name of the promotion.
   * @param creativeName The name of the creative.
   * @param creativeSlot The slot of the creative.
   */
  setPromotionContext(
    productId: string,
    promotionId: string,
    promotionName: string,
    creativeName: string,
    creativeSlot: string
  ): void {
    this.activePromotionContext = {
      productId,
      promotion_id: promotionId,
      promotion_name: promotionName,
      creative_name: creativeName,
      creative_slot: creativeSlot,
    };
  }

  /**
   * Clear the active promotion context.
   */
  clearPromotionContext(): void {
    this.activePromotionContext = null;
  }

  /**
   * Format a number as a currency.
   * @param num the number to format
   * @returns the number formatted as a currency, e.g. $1,000.00
   */
  private formatNumberAsCurrency(num: number): string {
    return new Intl.NumberFormat(environment.localCode, {
      style: 'currency',
      currency: environment.currency,
    }).format(num);
  }
}
