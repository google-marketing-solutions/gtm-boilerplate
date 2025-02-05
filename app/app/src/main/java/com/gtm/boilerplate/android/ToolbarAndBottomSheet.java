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

import android.animation.ValueAnimator;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;

public class ToolbarAndBottomSheet {
    private static EventListener eventListener;

    public interface EventListener {
        void onEvent(String eventName, Bundle params);
    }

    public static void setEventListener(EventListener listener) {
        eventListener = listener;
    }

    public static void initializeToolbarAndBottomSheet(AppCompatActivity activity) {

        Toolbar toolbar = activity.findViewById(R.id.my_toolbar);
        activity.setSupportActionBar(toolbar);

        TextView homeText = toolbar.findViewById(R.id.home_text);
        homeText.setOnClickListener(view -> {
            Intent homeIntent = new Intent(activity, MainActivity.class);
            activity.startActivity(homeIntent);
        });

        ImageView cartIcon = toolbar.findViewById(R.id.cart_icon);
        cartIcon.setOnClickListener(view -> {
            Intent cartIntent = new Intent(activity, CartActivity.class);
            activity.startActivity(cartIntent);
        });

        LinearLayout bottomSheet = activity.findViewById(R.id.bottom_sheet);
        TextView eventJsonTextView = activity.findViewById(R.id.event_json_textview);
        ImageView arrowIcon = activity.findViewById(R.id.arrow_icon);

        eventJsonTextView.setVisibility(View.GONE);
        arrowIcon.setImageResource(R.drawable.down_arrow);

        DisplayMetrics displayMetrics = new DisplayMetrics();
        activity.getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        int screenHeight = displayMetrics.heightPixels;

        int initialBottomSheetHeight = (int) TypedValue.applyDimension(
                TypedValue.COMPLEX_UNIT_DIP,
                55,
                activity.getResources().getDisplayMetrics()
        );

        LinearLayout.LayoutParams params = (LinearLayout.LayoutParams) bottomSheet.getLayoutParams();
        params.height = initialBottomSheetHeight;
        bottomSheet.setLayoutParams(params);

        bottomSheet.setOnClickListener(view -> {
            if (eventJsonTextView.getVisibility() == View.GONE) {
                // Expand with animation
                ValueAnimator animator = ValueAnimator.ofInt(bottomSheet.getHeight(), screenHeight * 4 / 10);
                animator.addUpdateListener(valueAnimator -> {
                    int value = (Integer) valueAnimator.getAnimatedValue();
                    params.height = value;
                    bottomSheet.setLayoutParams(params);
                });
                animator.setDuration(300);
                animator.start();

                eventJsonTextView.setVisibility(View.VISIBLE);
                arrowIcon.setImageResource(R.drawable.up_arrow);

                LinearLayout eventJsonWrapper = activity.findViewById(R.id.event_json_wrapper);

                eventJsonWrapper.removeAllViews();

                for (String jsonString : MyApplication.eventJsonList) {
                    TextView jsonTextView = generateJsonTextView(activity, jsonString);
                    eventJsonWrapper.addView(jsonTextView);
                }
            } else {
                ValueAnimator animator = ValueAnimator.ofInt(bottomSheet.getHeight(), initialBottomSheetHeight);
                animator.addUpdateListener(valueAnimator -> {
                    int value = (Integer) valueAnimator.getAnimatedValue();
                    params.height = value;
                    bottomSheet.setLayoutParams(params);
                });
                animator.setDuration(300);
                animator.start();

                eventJsonTextView.setVisibility(View.GONE);
                arrowIcon.setImageResource(R.drawable.down_arrow);
            }
        });

        setEventListener((EventListener) activity);
    }

    public static void addEventToJsonList(AppCompatActivity activity, String eventName, Bundle params) {
        if (eventListener != null) {
            eventListener.onEvent(eventName, params);
        }

        LinearLayout eventJsonWrapper = activity.findViewById(R.id.event_json_wrapper);

        String jsonString = getDemoJson(eventName, params);
        TextView jsonTextView = generateJsonTextView(activity, jsonString);

        eventJsonWrapper.addView(jsonTextView);
    }

    public static String getDemoJson(String eventName, Bundle params) {
        JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("event_name", eventName);
        JsonObject paramsJson = new JsonObject();
        for (String key : params.keySet()) {
            paramsJson.addProperty(key, String.valueOf(params.get(key)));
        }
        jsonObject.add("params", paramsJson);

        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        return gson.toJson(jsonObject);
    }

    public static String getJsonText(AppCompatActivity activity) {
        StringBuilder sb = new StringBuilder();
        for (String jsonString : MyApplication.eventJsonList) {
            sb.append(jsonString + "\n");
        }
        return sb.toString();
    }

    private static TextView generateJsonTextView(AppCompatActivity activity, String jsonString) {
        TextView eventJsonTextView = new TextView(activity);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
        );
        params.setMargins(10, 10, 10, 10);
        eventJsonTextView.setLayoutParams(params);
        eventJsonTextView.setText(jsonString);
        eventJsonTextView.setTextColor(Color.WHITE);
        eventJsonTextView.setBackgroundColor(Color.parseColor("#1e1628"));
        eventJsonTextView.setPadding(15, 10, 15, 10);
        eventJsonTextView.setAlpha(0.7f);
        return eventJsonTextView;
    }
}