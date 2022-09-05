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
"""The CRUD operations for working with products."""
from typing import Dict, Optional
import models
import products


def get_products() -> Dict[str, models.Product]:
    """Get the products for sale on the website.

    Returns:
        A dictionary where the keys are the product SKUs and the values are
        the products.
    """
    return {p['sku']: models.Product(**p) for p in products.RAW_PRODUCTS}


def get_product(sku: str) -> Optional[models.Product]:
    """Get the product with the sku argument.

    Args:
        sku: the sku of the product

    Returns:
        The product if it exists, else None
    """
    products_dict = get_products()
    return products_dict.get(sku)
