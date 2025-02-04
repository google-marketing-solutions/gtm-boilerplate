package com.soteria.firebaseapp.android;

import android.app.Application;
import java.util.List;
import java.util.ArrayList;

public class MyApplication extends Application {

    public static List<String> eventJsonList;

    static {
        eventJsonList = new ArrayList<>();
    }

    @Override
    public void onCreate() {
        super.onCreate();
    }
}