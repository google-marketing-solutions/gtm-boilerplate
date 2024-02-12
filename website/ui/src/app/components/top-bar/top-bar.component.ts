/**
 * @fileoverview this is the component for the top bar.
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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {BasketService} from 'src/app/services/basket.service';

/**
 * Top bar component.
 */
@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
})
export class TopBarComponent implements OnInit, OnDestroy {
  private eventSubscription!: Subscription;
  shakeCart = false;

  constructor(private basketService: BasketService) {}

  ngOnInit(): void {
    this.eventSubscription = this.basketService
      .onAddToCartEvent()
      .subscribe(() => {
        this.handleAddToCartEvent();
      });
  }

  /**
   * Handle the add to cart event by animating the cart icon.
   */
  private handleAddToCartEvent(): void {
    this.shakeCart = true;
    setTimeout(() => {
      this.shakeCart = false;
    }, 1000);
  }

  ngOnDestroy() {
    this.eventSubscription.unsubscribe();
  }
}
