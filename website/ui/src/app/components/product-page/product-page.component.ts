/**
 * @fileoverview this is the component for the product page.
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
import {ActivatedRoute} from '@angular/router';
import {Product, ProductVariant} from 'src/app/models/products';
import {BasketService} from 'src/app/services/basket.service';
import {EcommerceEventsService} from 'src/app/services/ecommerce-events.service';
import {ProductsService} from 'src/app/services/products.service';

/**
 * Product page component.
 */
@Component({
  selector: 'app-product-page',
  templateUrl: './product-page.component.html',
  styleUrls: ['./product-page.component.css'],
})
export class ProductPageComponent implements OnInit {
  productId: string | null = '';
  product?: Product;
  productVariant?: ProductVariant;
  addedToCart = false;
  addToCartText!: string;

  constructor(
    private route: ActivatedRoute,
    public productsService: ProductsService,
    public basketService: BasketService,
    private ecommerceEventsService: EcommerceEventsService,
  ) {
    this.setDefaultAddToCartText();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.productId = params.get('id');
    });
    if (this.productId != null) {
      this.product = this.productsService.products[this.productId];
      this.productVariant = this.productsService.getDefaultProductVariant(
        this.product,
      );
      this.ecommerceEventsService.sendViewItemEvent(
        this.product,
        this.productVariant,
      );
    }
  }

  /**
   * Set the default add to cart text for the button.
   */
  private setDefaultAddToCartText(): void {
    this.addToCartText = 'Add to Basket';
  }

  /**
   * Update the product variant based on the sku argument.
   * @param sku the sku of the new variant.
   */
  updateProductVariant(sku: string): void {
    if (this.product !== undefined) {
      this.productVariant = this.product.variants[sku];
      this.ecommerceEventsService.sendViewItemEvent(
        this.product,
        this.productVariant,
      );
    }
  }

  /**
   * Add the product to the basket.
   */
  addToBasket(): void {
    if (this.product != null && this.productVariant != null) {
      this.addedToCart = true;
      this.addToCartText = 'Done';
      this.basketService.updateBasket(this.product, this.productVariant, 1);
      this.ecommerceEventsService.sendAddToCartEvent(
        this.product,
        this.productVariant,
      );
      this.basketService.emitAddToCartEvent();
      setTimeout(() => {
        this.addedToCart = false;
        this.setDefaultAddToCartText();
      }, 300);
    }
  }
}
