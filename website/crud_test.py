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
"""Unit tests for crud.py"""
import unittest
import crud


class CrudTestCase(unittest.TestCase):

    def test_get_products(self):
        products = crud.get_products()
        self.assertEqual(len(products.keys()), 3)
        self.assertIn('shoes', products.keys())
        self.assertEqual(products['shoes'].name, 'Shoes')

    def test_get_product(self):
        product = crud.get_product('shoes')
        self.assertEqual(product.name, 'Shoes')

        product = crud.get_product('invalid-sku')
        self.assertIsNone(product)


if __name__ == '__main__':
    unittest.main()
