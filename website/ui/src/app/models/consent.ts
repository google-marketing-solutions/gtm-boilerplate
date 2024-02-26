/**
 * @fileoverview models for working with Consent.
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
 * This enum represents the two possible states for consent.
 */
export enum ConsentStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
}

/**
 * The supported options for a user's consent.
 */
export interface Consent {
  ad_storage: ConsentStatus;
  ad_user_data: ConsentStatus;
  analytics_storage: ConsentStatus;
  ad_personalization: ConsentStatus;
}

/**
 * With Google Tag Manager you have these statuses for managing consent.
 */
export enum ConsentUpdate {
  DEFAULT = 'default',
  UPDATE = 'update',
}
