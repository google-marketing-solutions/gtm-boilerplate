/**
 * Copyright 2025 Google LLC
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
package com.soteria.firebaseapp.android;

import java.util.ArrayList;
import java.util.List;

public class Cart {
    private static Cart instance;
    private List<Product> items;

    private Cart() {
        items = new ArrayList<>();
    }

    public static synchronized Cart getInstance() {
        if (instance == null) {
            instance = new Cart();
        }
        return instance;
    }

    public void addItem(Product product) {
        items.add(product);
    }

    public List<Product> getItems() {
        return items;
    }

    public void clearCart() {
        items.clear();
    }

    public Product findProduct(String productId) {
        for (Product p : items) {
            if (p.getId().equals(productId)) {
                return p;
            }
        }
        return null;
    }

    public void removeItem(Product product) {
        items.remove(product);
    }
}