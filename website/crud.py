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


def get_products() -> Dict[str, models.Product]:
    """Get the products for sale on the website.

    Returns:
        A dictionary where the keys are the product SKUs and the values are
        the products.
    """
    return {
        'blazer': models.Product(
            sku='blazer',
            name='Blazer',
            price='50',
            image='blazer.jpg',
            description='Lorem ipsum dolor sit amet, consectetur adipiscing.'),
        'tshirt': models.Product(
            sku='tshirt',
            name='T-Shirt',
            price='30',
            image='t-shirt.jpg',
            description='Lorem ipsum dolor sit amet, consectetur adipiscing.'),
        'shoes': models.Product(
            sku='shoes',
            name='Shoes',
            price='80',
            image='shoes.jpg',
            description='Lorem ipsum dolor sit amet, consectetur adipiscing.'),
    }


def get_product(sku: str) -> Optional[models.Product]:
    """Get the product with the sku argument.

    Args:
        sku: the sku of the product

    Returns:
        The product if it exists, else None
    """
    products = get_products()
    return products.get(sku)
