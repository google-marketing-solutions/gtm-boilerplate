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