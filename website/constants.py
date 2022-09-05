# Copyright 2022 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Constants used throughout the project."""
import os

# By default, this project uses GBP £ as the base currency. To override this,
# update the currency code to one of the supported options here:
# https://support.google.com/analytics/answer/9796179
CURRENCY_CODE = os.environ.get('CURRENCY_CODE', 'GBP')
# And set the appropriate currency symbol
CURRENCY_SYMBOL = os.environ.get('CURRENCY_SYMBOL', '£')
