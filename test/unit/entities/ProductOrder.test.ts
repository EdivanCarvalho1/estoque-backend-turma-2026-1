import { ProductOrder } from "../../../src/entities/ProductOrder";
import { Product } from "../../../src/entities/Product";

describe("testing ProductOrder entity", () => {
  test("should create a product order with valid properties", () => {
    const product = Product.rebuild("1234567890123", "Biscoito Recheado", 100);
    const orderQuantity: number = 10;
    const orderDate: Date = new Date();

    const productOrder = ProductOrder.create(product, orderQuantity, orderDate);

    expect(productOrder).toBeInstanceOf(ProductOrder);

    if (productOrder instanceof ProductOrder) {
      expect(productOrder.getId()).toBeDefined();
      expect(productOrder.getProduct()).toBe(product);
      expect(productOrder.getOrderQuantity()).toBe(orderQuantity);
      expect(productOrder.getOrderDate()).toBe(orderDate);
      expect(productOrder.getStatus()).toBe("opened");
    }
  });

  test("should return error when order quantity is less than or equal to zero", () => {
    const product = Product.rebuild("1234567890123", "Biscoito Recheado", 100);
    const orderQuantity: number = 0;
    const orderDate: Date = new Date();

    const productOrder = ProductOrder.create(product, orderQuantity, orderDate);

    expect(productOrder).toBeInstanceOf(Error);
    if (productOrder instanceof Error) {
      expect(productOrder.message).toBe("A quantidade do pedido deve ser maior que zero.");
    }
  });

  test("should return error when order quantity is not a valid number", () => {
    const product = Product.rebuild("1234567890123", "Biscoito Recheado", 100);
    const orderQuantity: any = "ten";
    const orderDate: Date = new Date();
    const productOrder = ProductOrder.create(product, orderQuantity, orderDate);

    expect(productOrder).toBeInstanceOf(Error);
    if (productOrder instanceof Error) {
      expect(productOrder.message).toBe("A quantidade do pedido deve ser um número inteiro.");
    }
  });

  test("should return error when order quantity is not an integer", () => {
    const product = Product.rebuild("1234567890123", "Biscoito Recheado", 100);
    const orderQuantity: any = 10.5;
    const orderDate: Date = new Date();
    const productOrder = ProductOrder.create(product, orderQuantity, orderDate);
    expect(productOrder).toBeInstanceOf(Error);
    if (productOrder instanceof Error) {
      expect(productOrder.message).toBe("A quantidade do pedido deve ser um número inteiro.");
    }
  });

  test("should return error when order date is in the future", () => {
    const product = Product.rebuild("1234567890123", "Biscoito Recheado", 100);
    const orderQuantity: number = 10;
    const orderDate: Date = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const productOrder = ProductOrder.create(product, orderQuantity, orderDate);

    expect(productOrder).toBeInstanceOf(Error);
    if (productOrder instanceof Error) {
      expect(productOrder.message).toBe("A data do pedido não pode ser no futuro.");
    }
  });

  test("should return error when product is not provided", () => {
    const orderQuantity: number = 10;
    const orderDate: Date = new Date();
    const product = null;
    const productOrder = ProductOrder.create(product, orderQuantity, orderDate);

    expect(productOrder).toBeInstanceOf(Error);
    if (productOrder instanceof Error) {
      expect(productOrder.message).toBe("O produto do pedido é obrigatório.");
    }
  });

  test("should format order date correctly", () => {
    const product = Product.rebuild("1234567890123", "Biscoito Recheado", 100);
    const orderQuantity: number = 10;
    const orderDate: Date = new Date("2024-01-01T12:00:00Z");

    const productOrder = ProductOrder.create(product, orderQuantity, orderDate);

    expect(productOrder).toBeInstanceOf(ProductOrder);

    if (productOrder instanceof ProductOrder) {
      expect(productOrder.formatOrderDate()).toBe("2024-01-01 12:00:00Z");
    }
  });

  test("should only format a date suffix when it is at the end", () => {
    const product = Product.rebuild("1234567890123", "Biscoito Recheado", 100);
    const dateWithSuffix = {
      getTime: () => 0,
      toISOString: () => "2024-01-01T12:00:00.000Zsuffix",
    } as unknown as Date;
    const productOrder = ProductOrder.create(product, 10, dateWithSuffix);

    expect(productOrder).toBeInstanceOf(ProductOrder);
    if (productOrder instanceof Error) return;
    expect(productOrder.formatOrderDate()).toBe("2024-01-01 12:00:00.000Zsuffix");
  });
});
