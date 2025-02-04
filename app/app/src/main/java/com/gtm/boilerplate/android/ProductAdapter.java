package com.soteria.firebaseapp.android;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;
import java.util.List;

public class ProductAdapter extends ArrayAdapter<Product> {

    public ProductAdapter(Context context, List<Product> products) {
        super(context, 0, products);
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        Product product = getItem(position);

        if (convertView == null) {
            convertView = LayoutInflater.from(getContext()).inflate(R.layout.product_list_item, parent, false);
        }

        ImageView productImageView = convertView.findViewById(R.id.product_imageview);
        TextView productNameTextView = convertView.findViewById(R.id.product_name_textview);
        TextView productPriceTextView = convertView.findViewById(R.id.product_price_textview);

        productImageView.setImageResource(product.getImageResource());
        productNameTextView.setText(product.getName());
        productPriceTextView.setText(String.format("$%.2f", product.getPrice()));

        return convertView;
    }
}
