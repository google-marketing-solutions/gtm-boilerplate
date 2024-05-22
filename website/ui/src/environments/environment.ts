/**
 * @fileoverview the default environment variables used in the project.
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

export const environment = {
  production: false,
  // This is the currency used for all products and tagging/conversions
  currency: 'GBP',
  // This is the ISO_639 language code and the ISO_3166-1 Alpha 2 country code.
  // https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
  // https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
  // This is used to determine the pricing number format. For example, 'en-GB'
  // will format a number as '1,000.53'
  localCode: 'en-GB',
  // The ID of the container in Google Tag Manager, e.g. GTM-XXXXXXXX
  gtmContainerId: 'GTM-XXXXXXXX',
  //The path the scripts are loaded from. Change for loading scripts from your server instead (https://developers.google.com/tag-platform/tag-manager/server-side/dependency-serving)
  gtmResourcePath: 'https://www.googletagmanager.com/gtm.js',
};
