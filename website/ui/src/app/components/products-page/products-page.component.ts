/**
 * @fileoverview this is the component for the products page.
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
import {EventsService} from 'src/app/services/events.service';
import {ProductsService} from 'src/app/services/products.service';

/**
 * Products page component.
 */
@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrls: ['./products-page.component.css'],
})
export class ProductsPageComponent implements OnInit {
  constructor(
    private productsService: ProductsService,
    private eventsService: EventsService,
  ) {}

  ngOnInit(): void {
    this.eventsService.sendViewItemListEvent(
      this.productsService.products,
    );
  }
}
