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
"""A simple e-commerce store using Flask & Google Tag Manager."""
import os
import uuid
from flask import Flask, redirect, request, session, url_for
from flask import render_template
import crud

# The port to run the application on
import models

PORT = int(os.environ.get('PORT', 8080))
# The container ID of your Web GTM container
GTM_WEB_CONTAINER_ID = os.environ.get('GTM_WEB_CONTAINER_ID')
# Flask secret key
SECRET_KEY = os.environ.get('SECRET_KEY')

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY


@app.context_processor
def inject_gtm_web_container_id():
    return dict(gtm_web_container_id=GTM_WEB_CONTAINER_ID)


@app.route('/')
def home():
    """The entry point for the home page."""
    return render_template('index.html')


@app.route('/products/')
def products_page():
    """A page listing all the products."""
    products = crud.get_products()
    response = {
        'products': products.values()
    }
    return render_template('products.html', content=response)


@app.route('/product/<sku>')
def product_page(sku: str):
    """The product details page for a product."""
    response = {
        'product': crud.get_product(sku),
    }
    return render_template('product.html', content=response)


@app.route('/basket', methods=['POST'])
def update_basket():
    """An end point for adding items to a basket.

    The request can contain an optional payload for modifying the contents of
    the data:

    {
        'sku': 'abc-123',
        'operation': '+',
        'change_quantity': 1
    }

    The operation can either be a `+` or a `-`.
    """
    data = request.get_json(silent=True)
    sku = data.get('sku')
    change_quantity = data.get('change_quantity', 1)
    operation = data.get('operation', '+')
    product = crud.get_product(sku)
    if product is not None:
        basket = models.Basket(**session.get('basket', {}))
        basket_product = basket.products.get(sku, models.BasketProduct(
            product=product,
            quantity=0
        ))
        if operation == '+':
            basket_product.quantity += change_quantity
        else:
            basket_product.quantity -= change_quantity

        # If there are no items remaining remove it from the basket
        if basket_product.quantity <= 0:
            del basket.products[sku]
        else:
            basket.products[sku] = basket_product

        session['basket'] = basket.dict()
    return '', 204


@app.route('/basket')
def view_basket():
    """A page displaying basket contents."""
    response = {
        'basket': models.Basket(**session.get('basket', {})),
    }
    return render_template('basket.html', content=response)


@app.route('/clear-basket', methods=['POST'])
def clear_basket():
    """An end point for clearing all items from a basket."""
    session.pop('basket')
    return '', 204


@app.route('/thank-you')
def view_order_page():
    """A page displaying the order confirmation."""
    if 'basket' not in session:
        return redirect(url_for('home'))
    basket = models.Basket(**session.pop('basket'))
    if basket.is_empty():
        return redirect(url_for('home'))
    response = {
        'basket': basket,
        'transaction_id': str(uuid.uuid4()),
    }
    return render_template('order-confirmation.html', content=response)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=PORT)
