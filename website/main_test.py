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
"""Unit tests for main.py"""
import unittest
from contextlib import contextmanager
from flask import session
from flask import template_rendered
import main
import models


# See the Flask documentation for more information:
# https://flask.palletsprojects.com/en/2.2.x/signals/#subscribing-to-signals
@contextmanager
def captured_templates(app):
    recorded = []

    def record(sender, template, context, **extra):
        recorded.append((template, context))
    template_rendered.connect(record, app)
    try:
        yield recorded
    finally:
        template_rendered.disconnect(record, app)


class MainTestCase(unittest.TestCase):

    def setUp(self) -> None:
        self.app = main.app
        self.app.secret_key = 'abc-123'
        self.client = self.app.test_client()

    def test_update_basket(self):
        with self.client:
            _ = self.client.post('/basket', json={'sku': 'shoes'})
            self.assertIn('basket', session)
            basket = models.Basket(**session['basket'])
            self.assertEqual(len(basket.products.keys()), 1)
            self.assertIn('shoes', basket.products)
            self.assertEqual(basket.products['shoes'].quantity, 1)

            _ = self.client.post('/basket', json={'sku': 'shoes'})
            basket = models.Basket(**session['basket'])
            self.assertEqual(basket.products['shoes'].quantity, 2)

            _ = self.client.post('/basket', json={'sku': 'tshirt'})
            basket = models.Basket(**session['basket'])
            self.assertIn('tshirt', basket.products)
            self.assertEqual(basket.products['tshirt'].quantity, 1)

            _ = self.client.post('/basket/unknown', json={'sku': 'sku'})
            basket = models.Basket(**session['basket'])
            self.assertEqual(len(basket.products.keys()), 2)

    def test_update_basket_change_quantity(self):
        with self.client:
            _ = self.client.post('/basket', json={'sku': 'shoes'})
            self.assertIn('basket', session)
            basket = models.Basket(**session['basket'])
            self.assertEqual(len(basket.products.keys()), 1)
            self.assertIn('shoes', basket.products)
            self.assertEqual(basket.products['shoes'].quantity, 1)

            _ = self.client.post('/basket', json={
                'sku': 'shoes',
                'operation': '+',
                'change_quantity': 3,
            })
            self.assertIn('basket', session)
            basket = models.Basket(**session['basket'])
            self.assertEqual(len(basket.products.keys()), 1)
            self.assertIn('shoes', basket.products)
            self.assertEqual(basket.products['shoes'].quantity, 4)

            _ = self.client.post('/basket', json={
                'sku': 'shoes',
                'operation': '-',
                'change_quantity': 4,
            })
            self.assertIn('basket', session)
            basket = models.Basket(**session['basket'])
            self.assertEqual(len(basket.products.keys()), 0)
            self.assertNotIn('shoes', basket.products)

    def test_clear_basket(self):
        with self.client:
            with self.client.session_transaction() as sess:
                sess['basket'] = models.Basket().dict()

            response = self.client.post('/clear-basket')
            self.assertEqual(response.status_code, 204)
            self.assertNotIn('basket', session)

    def test_thank_you_page(self):
        with self.client:
            response = self.client.get('/thank-you')
            self.assertEqual(response.status_code, 302)

            with self.client.session_transaction() as sess:
                sess['basket'] = models.Basket().dict()

            response = self.client.get('/thank-you')
            self.assertEqual(response.status_code, 302)

            product = models.Product(sku='shoes', name='Shoes', price='80')
            basket_product = models.BasketProduct(product=product, quantity=1)
            basket = models.Basket(products={'shoes': basket_product})

            with self.client.session_transaction() as sess:
                sess['basket'] = basket.dict()

            response = self.client.get('/thank-you')
            self.assertEqual(response.status_code, 200)

    def test_login(self):
        with self.client:
            with captured_templates(self.app) as templates:
                response = self.client.get('/login')
                self.assertEqual(response.status_code, 200)
                self.assertEqual(len(templates), 1)
                _, context = templates[0]
                self.assertEqual(context['content']['next'], '/')

            with captured_templates(self.app) as templates:
                response = self.client.get('/login?next=/test-page')
                self.assertEqual(response.status_code, 200)
                self.assertEqual(len(templates), 1)
                _, context = templates[0]
                self.assertEqual(context['content']['next'], '/test-page')

            with captured_templates(self.app) as templates:
                response = self.client.get('/login?next=https://evilpage.com')
                self.assertEqual(response.status_code, 200)
                self.assertEqual(len(templates), 1)
                _, context = templates[0]
                self.assertEqual(context['content']['next'], '/')

            user = models.User(
                name='Sarah',
                email='sarah@example.com',
                user_id='000')

            response = self.client.post('/login', data=user.dict())
            self.assertEqual(response.status_code, 302)

            with self.client.session_transaction() as sess:
                self.assertEqual(sess['user'], user.dict())

    def test_logout(self):
        with self.client:
            response = self.client.get('/logout')
            self.assertEqual(response.status_code, 302)
            self.assertEqual(response.location, '/')

            response = self.client.get('/logout?next=/test-page')
            self.assertEqual(response.status_code, 302)
            self.assertEqual(response.location, '/test-page')

            response = self.client.get('/logout?next=https://evilpage.com')
            self.assertEqual(response.status_code, 302)
            self.assertEqual(response.location, '/')

            with self.client.session_transaction() as sess:
                sess['user'] = models.User(
                    name='Sarah',
                    email='sarah@example.com',
                    user_id='000').dict()

            response = self.client.get('/logout')
            self.assertEqual(response.status_code, 302)
            self.assertEqual(response.location, '/')

            with self.client.session_transaction() as sess:
                self.assertNotIn('user', sess)


if __name__ == '__main__':
    unittest.main()
