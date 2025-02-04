package com.soteria.firebaseapp.android;

import android.os.Bundle;
import android.util.Log;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.google.firebase.analytics.FirebaseAnalytics;

public class ProductDetailsActivity extends AppCompatActivity implements ToolbarAndBottomSheet.EventListener {

    private FirebaseAnalytics firebaseAnalytics;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_product_details);

        firebaseAnalytics = FirebaseAnalytics.getInstance(this);

        ToolbarAndBottomSheet.initializeToolbarAndBottomSheet(this);

        Product product = (Product) getIntent().getSerializableExtra("PRODUCT");

        TextView productNameTextView = findViewById(R.id.product_name_textview);
        productNameTextView.setText(product.getName());

        ImageView productImageView = findViewById(R.id.product_imageview);
        int imageResourceId = product.getImageResource();
        Log.d("ProductDetailsActivity", "Image resource ID: " + imageResourceId);
        productImageView.setImageResource(imageResourceId);

        TextView productPriceTextView = findViewById(R.id.product_price_textview);
        productPriceTextView.setText("$" + product.getPrice());

        Bundle viewItemParams = getViewItemBundle(product);
        firebaseAnalytics.logEvent(FirebaseAnalytics.Event.VIEW_ITEM, viewItemParams);
        ToolbarAndBottomSheet.addEventToJsonList(this, FirebaseAnalytics.Event.VIEW_ITEM, viewItemParams);

        Button addToCartButton = findViewById(R.id.add_to_cart_button);
        addToCartButton.setOnClickListener(view -> {
            Product existingProduct = Cart.getInstance().findProduct(product.getId());

            if (existingProduct != null) {
                existingProduct.setQuantity(existingProduct.getQuantity() + 1);
            } else {
                Cart.getInstance().addItem(product);
            }

            Bundle addToCartParams = getAddToCartBundle(product);
            firebaseAnalytics.logEvent(FirebaseAnalytics.Event.ADD_TO_CART, addToCartParams);
            ToolbarAndBottomSheet.addEventToJsonList(this, FirebaseAnalytics.Event.ADD_TO_CART, addToCartParams);

            Toolbar toolbar = findViewById(R.id.my_toolbar);
            ImageView cartIcon = toolbar.findViewById(R.id.cart_icon);

            Animation bounceAnimation = AnimationUtils.loadAnimation(this, R.anim.bounce);
            cartIcon.startAnimation(bounceAnimation);
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

    private Bundle getAddToCartBundle(Product product) {
        Bundle bundle = new Bundle();
        bundle.putString(FirebaseAnalytics.Param.ITEM_ID, product.getId());
        bundle.putString(FirebaseAnalytics.Param.ITEM_NAME, product.getName());
        bundle.putString(FirebaseAnalytics.Param.ITEM_CATEGORY, product.getCategory());
        bundle.putDouble(FirebaseAnalytics.Param.PRICE, product.getPrice());
        bundle.putLong(FirebaseAnalytics.Param.QUANTITY, 1);
        return bundle;
    }

    @Override
    public void onEvent(String eventName, Bundle params) {
        String jsonString = ToolbarAndBottomSheet.getDemoJson(eventName, params);
        MyApplication.eventJsonList.add(0, jsonString);
    }
}