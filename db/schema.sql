CREATE TABLE products (
    barcode TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    quantity_in_stock INTEGER NOT NULL
);

CREATE TABLE product_orders (
    id TEXT PRIMARY KEY,
    product_barcode TEXT NOT NULL,
    order_quantity INTEGER NOT NULL,
    order_date TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (product_barcode) REFERENCES products(barcode)
);

CREATE TABLE product_inputs (
    id TEXT PRIMARY KEY,
    product_order_id TEXT NOT NULL,
    input_quantity INTEGER NOT NULL,
    input_date TEXT NOT NULL,
    FOREIGN KEY (product_order_id) REFERENCES product_orders(id)
);

CREATE TABLE product_outputs (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    output_date TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(barcode)
);