/**
 * @fileoverview this is the component for the event stream.
 * The event stream shows ecommerce events in the side panel.
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

import {Component} from '@angular/core';
import {EcommerceEventsService} from 'src/app/services/ecommerce-events.service';

/**
 * Event Stream Component
 */
@Component({
  selector: 'app-event-stream',
  templateUrl: './event-stream.component.html',
  styleUrl: './event-stream.component.css',
})
export class EventStreamComponent {
  constructor(private ecommerceEventsService: EcommerceEventsService) {}

  /**
   * Get all the events that have been sent
   * @return the events as an array of formatted strings.
   */
  getEvents(): string[] {
    return this.ecommerceEventsService.events;
  }
}
