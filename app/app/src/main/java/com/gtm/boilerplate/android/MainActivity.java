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

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.analytics.FirebaseAnalytics;

public class MainActivity extends AppCompatActivity implements ToolbarAndBottomSheet.EventListener {

    private FirebaseAnalytics firebaseAnalytics;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        firebaseAnalytics = FirebaseAnalytics.getInstance(this);

        ToolbarAndBottomSheet.initializeToolbarAndBottomSheet(this);

        Product product1 = new Product("blazer_red_m", "Blazer", "Category A", 149.99, R.drawable.blazer_red, "blazer_red_m");
        Product product2 = new Product("shoes_5", "Shoes", "Category B", 79.99, R.drawable.shoes, "shoes_5");
        Product product3 = new Product("tshirt_l", "T-Shirt", "Category C", 30.99, R.drawable.tshirt, "tshirt_l");

        Bundle viewItemListParams = getViewItemListBundle(product1, product2, product3);
        firebaseAnalytics.logEvent(FirebaseAnalytics.Event.VIEW_ITEM_LIST, viewItemListParams);
        ToolbarAndBottomSheet.addEventToJsonList(this, FirebaseAnalytics.Event.VIEW_ITEM_LIST, viewItemListParams);

        Button product1Button = findViewById(R.id.product_1_button);
        product1Button.setOnClickListener(view -> {
            Intent intent = new Intent(MainActivity.this, ProductDetailsActivity.class);
            intent.putExtra("PRODUCT", product1);
            startActivity(intent);
        });

        Button product2Button = findViewById(R.id.product_2_button);
        product2Button.setOnClickListener(view -> {
            Intent intent = new Intent(MainActivity.this, ProductDetailsActivity.class);
            intent.putExtra("PRODUCT", product2);
            startActivity(intent);
        });

        Button product3Button = findViewById(R.id.product_3_button);
        product3Button.setOnClickListener(view -> {
            Intent intent = new Intent(MainActivity.this, ProductDetailsActivity.class);
            intent.putExtra("PRODUCT", product3);
            startActivity(intent);
        });
    }

    private Bundle getViewItemBundle(Product product) {
        Bundle bundle = new Bundle();
        bundle.putString(FirebaseAnalytics.Param.ITEM_ID, product.getId());
        bundle.putString(FirebaseAnalytics.Param.ITEM_NAME, product.getName());
        bundle.putString(FirebaseAnalytics.Param.ITEM_CATEGORY, product.getCategory());
        bundle.putDouble(FirebaseAnalytics.Param.PRICE, product.getPrice());
        return bundle;
    }

    private Bundle getViewItemListBundle(Product... products) {
        Bundle bundle = new Bundle();
        for (int i = 0; i < products.length; i++) {
            bundle.putString(FirebaseAnalytics.Param.ITEM_ID + "_" + (i + 1), products[i].getId());
            bundle.putString(FirebaseAnalytics.Param.ITEM_NAME + "_" + (i + 1), products[i].getName());
            bundle.putString(FirebaseAnalytics.Param.ITEM_CATEGORY + "_" + (i + 1), products[i].getCategory());
            bundle.putDouble(FirebaseAnalytics.Param.PRICE + "_" + (i + 1), products[i].getPrice());
        }
        return bundle;
    }

    @Override
    public void onEvent(String eventName, Bundle params) {
        String jsonString = ToolbarAndBottomSheet.getDemoJson(eventName, params);
        MyApplication.eventJsonList.add(0, jsonString);
    }
}