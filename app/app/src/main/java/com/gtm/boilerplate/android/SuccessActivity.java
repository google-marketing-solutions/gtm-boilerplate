package com.soteria.firebaseapp.android;

import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.analytics.FirebaseAnalytics;
import java.util.UUID;

public class SuccessActivity extends AppCompatActivity implements ToolbarAndBottomSheet.EventListener {

    private FirebaseAnalytics firebaseAnalytics;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_success);

        firebaseAnalytics = FirebaseAnalytics.getInstance(this);

        ToolbarAndBottomSheet.initializeToolbarAndBottomSheet(this);

        String orderId = generateUniqueOrderId();

        TextView orderIdTextView = findViewById(R.id.order_id_textview);
        orderIdTextView.setText("Order ID: " + orderId);

        String purchaseJson = getIntent().getStringExtra("PURCHASE_JSON");

    }

    private String generateUniqueOrderId() {
        return UUID.randomUUID().toString().substring(0, 16);
    }

    @Override
    public void onEvent(String eventName, Bundle params) {
        // Not used in this activity, but required to implement the EventListener interface
    }
}