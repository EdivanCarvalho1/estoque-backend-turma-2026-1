import { Product } from "../../../src/entities/Product";
import { InfrastructureError } from "../../../src/InfrastructureError";
import { ProductRepository } from "../../../src/repositories/ProductRepository";
import { SqliteConnection } from "../../../src/repositories/SqliteConnection";

describe("ProductRepository tests", () => {
  const sqliteConnection = new SqliteConnection("db/estoque-test.sqlite");

  beforeEach(() => {
    const connection = sqliteConnection.getConnection();
    connection.exec("DELETE FROM product_inputs");
    connection.exec("DELETE FROM product_orders");
    connection.exec("DELETE FROM products");
  });

  test("should return an infrastructure error when creating a product fails", () => {
    const repository = new ProductRepository({
      getConnection: () => ({
        prepare: () => {
          throw new Error("database unavailable");
        },
      }),
    } as any);

    const result = repository.create(
      Product.rebuild("1234567890123", "Biscoito Recheado", 100),
    );

    expect(result).toEqual(new InfrastructureError("Database error"));
  });

  test("should return null when a product does not exist", () => {
    const result = new ProductRepository(sqliteConnection).findByBarcode("missing-barcode");

    expect(result).toBeNull();
  });

  test("should update a product stock", () => {
    const repository = new ProductRepository(sqliteConnection);
    const product = Product.rebuild("1234567890123", "Biscoito Recheado", 100);

    expect(repository.create(product)).toBeUndefined();
    expect(repository.updateStock(product.getBarcode(), 120)).toBeUndefined();

    const result = repository.findByBarcode(product.getBarcode());
    expect(result).toBeInstanceOf(Product);
    if (result instanceof Product) {
      expect(result.getQuantityInStock()).toBe(120);
    }
  });

  test("should return an infrastructure error when updating stock fails", () => {
    const repository = new ProductRepository({
      getConnection: () => ({
        prepare: () => {
          throw new Error("database unavailable");
        },
      }),
    } as any);

    expect(repository.updateStock("1234567890123", 120)).toEqual(
      new InfrastructureError("Database error"),
    );
  });
});
