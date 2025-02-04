package com.soteria.firebaseapp.android;

import java.io.Serializable;

public class Product implements Serializable {
    private String id;
    private String name;
    private String category;
    private double price;
    private int imageResource;
    private int quantity = 1;
    private String sku; // Add SKU field

    public Product(String id, String name, String category, double price, int imageResource, String sku) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.imageResource = imageResource;
        this.sku = sku;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getImageResource() {
        return imageResource;
    }

    public void setImageResource(int imageResource) {
        this.imageResource = imageResource;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }
}