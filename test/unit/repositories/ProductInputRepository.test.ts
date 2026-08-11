import { Product } from "../../../src/entities/Product";
import { ProductInput } from "../../../src/entities/ProductInput";
import { ProductOrder } from "../../../src/entities/ProductOrder";
import { InfrastructureError } from "../../../src/InfrastructureError";
import { ProductInputRepository } from "../../../src/repositories/ProductInputRepository";
import { ProductOrderRepository } from "../../../src/repositories/ProductOrderRepository";
import { ProductRepository } from "../../../src/repositories/ProductRepository";
import { SqliteConnection } from "../../../src/repositories/SqliteConnection";

describe("ProductInputRepository tests", () => {
  const sqliteConnection = new SqliteConnection("db/estoque-test.sqlite");

  beforeEach(() => {
    const connection = sqliteConnection.getConnection();
    connection.exec("DELETE FROM product_inputs");
    connection.exec("DELETE FROM product_orders");
    connection.exec("DELETE FROM products");
  });

  test("should create a product input", () => {
    const product = Product.rebuild("1234567890123", "Biscoito Recheado", 100);
    const order = ProductOrder.create(
      product,
      20,
      new Date("2024-01-01T12:00:00.000Z"),
    );

    expect(order).toBeInstanceOf(ProductOrder);
    if (order instanceof Error) return;

    const productRepository = new ProductRepository(sqliteConnection);
    const productOrderRepository = new ProductOrderRepository(sqliteConnection);
    const productInputRepository = new ProductInputRepository(sqliteConnection);
    productRepository.create(product);
    productOrderRepository.create(order);

    const inputDate = new Date("2024-01-02T12:00:00.000Z");
    const productInput = ProductInput.create(order, 20, inputDate);

    expect(productInput).toBeInstanceOf(ProductInput);
    if (productInput instanceof Error) return;

    const result = productInputRepository.create(productInput);

    expect(result).toBeUndefined();
    const row = sqliteConnection.getConnection()
      .prepare("SELECT * FROM product_inputs WHERE id = ?")
      .get(productInput.getId()) as {
        id: string;
        product_order_id: string;
        input_quantity: number;
        input_date: string;
      };
    expect(row).toEqual({
      id: productInput.getId(),
      product_order_id: order.getId(),
      input_quantity: 20,
      input_date: "2024-01-02 12:00:00Z",
    });
  });

  test("should return an infrastructure error when creating an input fails", () => {
    const productInputRepository = new ProductInputRepository({
      getConnection: () => ({
        prepare: () => {
          throw new Error("database unavailable");
        },
      }),
    } as any);

    const result = productInputRepository.create({} as ProductInput);

    expect(result).toEqual(new InfrastructureError("Failed to create product input"));
  });
});
