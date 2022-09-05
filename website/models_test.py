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
"""Unit tests for models.py"""
import decimal
import unittest
import models


class ModelsTestCase(unittest.TestCase):
    def test_product_price(self):
        price = decimal.Decimal('435.96')
        product = models.Product(sku='abc', name='test', price=price)
        self.assertEqual(product.price, price)

        price = decimal.Decimal('123.456')
        with self.assertRaises(ValueError):
            models.Product(sku='abc', name='test', price=price)

        product = models.Product(sku='abc', name='test', price='50')
        self.assertEqual(product.price, decimal.Decimal('50'))

    def test_basket_get_formatted_price(self):
        basket = models.Basket()
        product = models.Product(sku='abc', name='test', price='20')
        bp = models.BasketProduct(product=product, quantity=5)
        basket.products['abc'] = bp
        product = models.Product(sku='def', name='test2', price='30')
        bp = models.BasketProduct(product=product, quantity=3)
        basket.products['def'] = bp
        self.assertEqual(basket.get_formatted_price(), '£190.00')
        self.assertEqual(basket.get_formatted_price('$'), '$190.00')


if __name__ == '__main__':
    unittest.main()
