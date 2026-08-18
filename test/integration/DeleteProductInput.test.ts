import { Product } from "../../src/entities/Product";
import { ProductInput } from "../../src/entities/ProductInput";
import { ProductOrder } from "../../src/entities/ProductOrder";
import { ProductInputRepository } from "../../src/repositories/ProductInputRepository";
import { ProductOrderRepository } from "../../src/repositories/ProductOrderRepository";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { DeleteProductInputUsecase } from "../../src/usecases/DeleteProductInputUsecase";

describe("DeleteProductInput integration tests", () => {
  const connection = new SqliteConnection("db/estoque-test.sqlite");

  beforeEach(() => {
    const database = connection.getConnection();
    database.exec("DELETE FROM product_inputs");
    database.exec("DELETE FROM product_orders");
    database.exec("DELETE FROM products");
  });

  test("should delete the input, decrement stock and reopen the order", () => {
    const productRepository = new ProductRepository(connection);
    const orderRepository = new ProductOrderRepository(connection);
    const inputRepository = new ProductInputRepository(connection);
    const usecase = new DeleteProductInputUsecase(inputRepository, orderRepository, productRepository);
    const product = Product.rebuild("789100000001", "Produto teste", 10);
    const order = ProductOrder.rebuild(
      "order-id", product, 10, new Date("2026-08-10T12:00:00.000Z"), "closed",
    );
    const input = ProductInput.rebuild(
      "input-id", order, 10, new Date("2026-08-15T12:00:00.000Z"),
    );
    productRepository.create(product);
    orderRepository.create(order);
    inputRepository.create(input);

    expect(usecase.execute(input.getId())).toBeUndefined();
    expect(inputRepository.findById(input.getId())).toBeNull();

    const updatedProduct = productRepository.findByBarcode(product.getBarcode());
    expect(updatedProduct).toBeInstanceOf(Product);
    expect((updatedProduct as Product).getQuantityInStock()).toBe(0);

    const updatedOrder = orderRepository.findById(order.getId());
    expect(updatedOrder).toBeInstanceOf(ProductOrder);
    expect((updatedOrder as ProductOrder).getStatus()).toBe("opened");
  });
});
