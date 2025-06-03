// website/ui/src/app/components/products-page/products-page.component.ts
/**
 * @fileoverview this is the component for the products page.
 *
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Product, ProductVariant } from "src/app/models/products";
import { EcommerceEventsService } from "src/app/services/ecommerce-events.service";
import { ProductsService } from "src/app/services/products.service";

interface PromotionData {
  promotion_id: string;
  promotion_name: string;
  creative_name: string;
  creative_slot: string;
}

/**
 * Products page component.
 */
@Component({
  selector: "app-products-page",
  templateUrl: "./products-page.component.html",
  styleUrls: ["./products-page.component.css"],
})
export class ProductsPageComponent implements OnInit {
  private promotionDataOptions: PromotionData[] = [
    {
      promotion_id: "summer_sale_hats",
      promotion_name: "Summer Hats Blowout",
      creative_name: "Summer Hats Banner A",
      creative_slot: "products_page_bottom_slot_1",
    },
    {
      promotion_id: "new_arrivals_hats",
      promotion_name: "Fresh Hat Styles",
      creative_name: "New Hat Styles Banner B",
      creative_slot: "products_page_bottom_slot_2",
    },
    {
      promotion_id: "hat_clearance",
      promotion_name: "Hat Clearance Event",
      creative_name: "Clearance Hat Banner C",
      creative_slot: "products_page_bottom_slot_3",
    },
    {
      promotion_id: "hat_essentials",
      promotion_name: "Everyday Hat Essentials",
      creative_name: "Essential Hat Banner D",
      creative_slot: "products_page_bottom_slot_4",
    },
  ];
  private currentPromotionData: PromotionData | null = null;

  constructor(
    private productsService: ProductsService,
    private ecommerceEventsService: EcommerceEventsService,
    private router: Router
  ) {
    const randomIndex = Math.floor(
      Math.random() * this.promotionDataOptions.length
    );
    this.currentPromotionData = this.promotionDataOptions[randomIndex];
  }

  ngOnInit(): void {
    this.ecommerceEventsService.sendViewItemListEvent(
      this.productsService.products
    );

    const tshirtProduct: Product = this.productsService.products["tshirt"];
    const tshirtVariant: ProductVariant =
      this.productsService.getDefaultProductVariant(tshirtProduct);

    if (this.currentPromotionData) {
      this.ecommerceEventsService.sendViewPromotionEvent(
        tshirtProduct,
        tshirtVariant,
        this.currentPromotionData.promotion_id,
        this.currentPromotionData.promotion_name,
        this.currentPromotionData.creative_name,
        this.currentPromotionData.creative_slot
      );
    }
  }

  /**
   * Handles the click on the promotion banner.
   * Sends a select_promotion event and navigates to the T-shirt product page.
   */
  onPromotionClick(): void {
    const tshirtProduct: Product = this.productsService.products["tshirt"];
    const tshirtVariant: ProductVariant =
      this.productsService.getDefaultProductVariant(tshirtProduct);

    if (this.currentPromotionData) {
      this.ecommerceEventsService.sendSelectPromotionEvent(
        tshirtProduct,
        tshirtVariant,
        this.currentPromotionData.promotion_id,
        this.currentPromotionData.promotion_name,
        this.currentPromotionData.creative_name,
        this.currentPromotionData.creative_slot
      );
    }
    this.router.navigate(["/product", "tshirt"]);
  }
}
