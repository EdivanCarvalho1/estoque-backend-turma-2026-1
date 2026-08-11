import { Product } from "../../src/entities/Product";
import { ProductInput } from "../../src/entities/ProductInput";
import { ProductOrder } from "../../src/entities/ProductOrder";
import { ProductInputRepository } from "../../src/repositories/ProductInputRepository";
import { ProductOrderRepository } from "../../src/repositories/ProductOrderRepository";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { CreateProductInputUsecase } from "../../src/usecases/CreateProductInputUsecase";

describe("CreateProductInput integration tests", () => {
  const sqliteConnection = new SqliteConnection("db/estoque-test.sqlite");

  beforeEach(() => {
    const connection = sqliteConnection.getConnection();
    connection.exec("DELETE FROM product_inputs");
    connection.exec("DELETE FROM product_orders");
    connection.exec("DELETE FROM products");
  });

  test("should create and persist an input for a product order", () => {
    const productRepository = new ProductRepository(sqliteConnection);
    const productOrderRepository = new ProductOrderRepository(sqliteConnection);
    const productInputRepository = new ProductInputRepository(sqliteConnection);
    const usecase = new CreateProductInputUsecase(
      productOrderRepository,
      productInputRepository,
      productRepository,
    );
    const product = Product.rebuild("1234567890123", "Biscoito Recheado", 100);
    const order = ProductOrder.create(
      product,
      20,
      new Date("2024-01-01T12:00:00.000Z"),
    );

    expect(order).toBeInstanceOf(ProductOrder);
    if (order instanceof Error) return;
    expect(productRepository.create(product)).toBeUndefined();
    expect(productOrderRepository.create(order)).toBeUndefined();

    const inputDate = new Date("2024-01-02T12:00:00.000Z");
    const result = usecase.execute(order.getId(), 20, inputDate);

    expect(result).toBeInstanceOf(Object);
    if (result instanceof Error) return;
    expect(result.productOrder.getId()).toBe(order.getId());
    expect(result.inputQuantity).toBe(20);
    expect(result.inputDate).toBe(inputDate);

    const persistedInput = sqliteConnection.getConnection()
      .prepare("SELECT * FROM product_inputs WHERE id = ?")
      .get(result.id) as {
        id: string;
        product_order_id: string;
        input_quantity: number;
        input_date: string;
      };
    expect(persistedInput).toEqual({
      id: result.id,
      product_order_id: order.getId(),
      input_quantity: 20,
      input_date: "2024-01-02 12:00:00Z",
    });
    expect(result.productOrder).toBeInstanceOf(ProductOrder);
    expect(result.productOrder.getProduct()).toBeInstanceOf(Product);
    expect(result.productOrder.getProduct().getBarcode()).toBe(product.getBarcode());
    expect(result.productOrder.getProduct().getQuantityInStock()).toBe(120);
    expect(result.productOrder.getStatus()).toBe("closed");
    expect(result).not.toBeInstanceOf(ProductInput);

    const persistedProduct = sqliteConnection.getConnection()
      .prepare("SELECT quantity_in_stock FROM products WHERE barcode = ?")
      .get(product.getBarcode()) as { quantity_in_stock: number };
    expect(persistedProduct.quantity_in_stock).toBe(120);

    const persistedOrder = sqliteConnection.getConnection()
      .prepare("SELECT status FROM product_orders WHERE id = ?")
      .get(order.getId()) as { status: string };
    expect(persistedOrder.status).toBe("closed");
  });
});
