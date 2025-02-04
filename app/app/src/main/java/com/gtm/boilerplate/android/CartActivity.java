package com.soteria.firebaseapp.android;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.analytics.FirebaseAnalytics;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CartActivity extends AppCompatActivity implements ToolbarAndBottomSheet.EventListener {

    private FirebaseAnalytics firebaseAnalytics;
    private Button checkoutButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_cart);

        firebaseAnalytics = FirebaseAnalytics.getInstance(this);

        ToolbarAndBottomSheet.initializeToolbarAndBottomSheet(this);

        List<Product> cartItems = Cart.getInstance().getItems();

        double cartTotal = calculateCartTotal(cartItems);
        TextView cartTotalTextView = findViewById(R.id.cart_total_textview);
        cartTotalTextView.setText("Total: $" + cartTotal);

        checkoutButton = findViewById(R.id.checkout_button);

        LinearLayout cartItemsContainer = findViewById(R.id.cart_items_container);

        for (Product product: cartItems) {
            View itemView = getLayoutInflater().inflate(R.layout.cart_item, null);
            TextView productNameTextView = itemView.findViewById(R.id.product_name_textview);
            productNameTextView.setText(product.getName());
            TextView productPriceTextView = itemView.findViewById(R.id.product_price_textview);
            productPriceTextView.setText(String.valueOf(product.getPrice()));
            ImageView productImageView = itemView.findViewById(R.id.product_imageview);
            productImageView.setImageResource(product.getImageResource());

            TextView quantityTextView = itemView.findViewById(R.id.quantity_textview);
            quantityTextView.setText(String.valueOf(product.getQuantity()));
            Button increaseButton = itemView.findViewById(R.id.increase_button);
            Button decreaseButton = itemView.findViewById(R.id.decrease_button);

            increaseButton.setOnClickListener(v -> {
                product.setQuantity(product.getQuantity() + 1);
                quantityTextView.setText(String.valueOf(product.getQuantity()));
                updateCartTotal();
            });

            decreaseButton.setOnClickListener(v -> {
                if (product.getQuantity() > 1) {
                    product.setQuantity(product.getQuantity() - 1);
                    quantityTextView.setText(String.valueOf(product.getQuantity()));
                    updateCartTotal();
                } else {
                    Cart.getInstance().removeItem(product);
                    cartItemsContainer.removeView(itemView);
                    updateCartTotal();
                }
            });

            cartItemsContainer.addView(itemView);
        }

        checkoutButton.setOnClickListener(view -> {
            if (checkoutButton.getText().toString().equals("Add products")) {
                Intent mainIntent = new Intent(CartActivity.this, MainActivity.class);
                startActivity(mainIntent);
            } else {
                performCheckoutProcess();

                String orderId = generateUniqueOrderId();

                Bundle purchaseBundle = getPurchaseBundle(cartTotal, orderId);
                firebaseAnalytics.logEvent(FirebaseAnalytics.Event.PURCHASE, purchaseBundle);
                ToolbarAndBottomSheet.addEventToJsonList(this, FirebaseAnalytics.Event.PURCHASE, purchaseBundle);

                Intent successIntent = new Intent(CartActivity.this, SuccessActivity.class);
                successIntent.putExtra("PURCHASE_JSON", ToolbarAndBottomSheet.getDemoJson(FirebaseAnalytics.Event.PURCHASE, purchaseBundle));
                startActivity(successIntent);

                Cart.getInstance().clearCart();
                cartItemsContainer.removeAllViews();
                updateCheckoutButtonState();
            }
        });

        Bundle viewCartBundle = getViewCartBundle(cartItems);
        firebaseAnalytics.logEvent(FirebaseAnalytics.Event.VIEW_CART, viewCartBundle);
        ToolbarAndBottomSheet.addEventToJsonList(this, FirebaseAnalytics.Event.VIEW_CART, viewCartBundle);

        updateCheckoutButtonState();
    }

    private void performCheckoutProcess() {
        // Implement your checkout logic here
    }

    private String generateUniqueOrderId() {
        return UUID.randomUUID().toString().substring(0, 16);
    }

    private double calculateCartTotal(List<Product> cartItems) {
        double total = 0;
        for (Product product: cartItems) {
            total += product.getPrice() * product.getQuantity();
        }
        return total;
    }

    private Bundle getPurchaseBundle(double cartTotal, String orderId) {
        Bundle bundle = new Bundle();

        bundle.putString(FirebaseAnalytics.Param.TRANSACTION_ID, orderId);
        bundle.putString(FirebaseAnalytics.Param.AFFILIATION, "Store Name");
        bundle.putDouble(FirebaseAnalytics.Param.VALUE, cartTotal);
        bundle.putString(FirebaseAnalytics.Param.CURRENCY, "USD");

        // Use a regular ArrayList instead of ParcelableArrayList
        ArrayList<Bundle> items = new ArrayList<>(Cart.getInstance().getItems().size());

        for (Product product: Cart.getInstance().getItems()) {
            Bundle item = new Bundle();
            item.putString(FirebaseAnalytics.Param.ITEM_ID, product.getId());
            item.putString(FirebaseAnalytics.Param.ITEM_NAME, product.getName());
            item.putString(FirebaseAnalytics.Param.ITEM_CATEGORY, product.getCategory());
            item.putDouble(FirebaseAnalytics.Param.PRICE, product.getPrice());
            item.putLong(FirebaseAnalytics.Param.QUANTITY, product.getQuantity());
            item.putString(FirebaseAnalytics.Param.ITEM_VARIANT, product.getSku());
            items.add(item);
        }

        // Add the items ArrayList to the bundle
        bundle.putSerializable(FirebaseAnalytics.Param.ITEMS, items);

        return bundle;
    }

    private void updateCartTotal() {
        double cartTotal = calculateCartTotal(Cart.getInstance().getItems());
        TextView cartTotalTextView = findViewById(R.id.cart_total_textview);
        cartTotalTextView.setText("Total: $" + cartTotal);

        updateCheckoutButtonState();
    }

    private Bundle getViewCartBundle(List<Product> cartItems) {
        Bundle bundle = new Bundle();

        // Use a regular ArrayList instead of ParcelableArrayList
        ArrayList<Bundle> items = new ArrayList<>(cartItems.size());

        for (Product product: cartItems) {
            Bundle item = new Bundle();
            item.putString(FirebaseAnalytics.Param.ITEM_ID, product.getId());
            item.putString(FirebaseAnalytics.Param.ITEM_NAME, product.getName());
            item.putString(FirebaseAnalytics.Param.ITEM_CATEGORY, product.getCategory());
            item.putDouble(FirebaseAnalytics.Param.PRICE, product.getPrice());
            item.putLong(FirebaseAnalytics.Param.QUANTITY, product.getQuantity());
            item.putString(FirebaseAnalytics.Param.ITEM_VARIANT, product.getSku());
            items.add(item);
        }

        // Add the items ArrayList to the bundle
        bundle.putSerializable(FirebaseAnalytics.Param.ITEMS, items);

        return bundle;
    }

    private void updateCheckoutButtonState() {
        int cartItemCount = Cart.getInstance().getItems().size();
        if (cartItemCount > 0) {
            checkoutButton.setEnabled(true);
            checkoutButton.setText("Checkout");
        } else {
            checkoutButton.setText("Add products");
        }
    }

    @Override
    public void onEvent(String eventName, Bundle params) {
        String jsonString = ToolbarAndBottomSheet.getDemoJson(eventName, params);
        MyApplication.eventJsonList.add(0, jsonString);
    }
}