import { Product } from "../../../src/entities/Product";
import { ProductInput } from "../../../src/entities/ProductInput";
import { ProductOrder } from "../../../src/entities/ProductOrder";

describe("testing ProductInput entity", () => {
  test("should create an input linked to a product order with a UUID", () => {
    const product = Product.rebuild("1234567890123", "Biscoito Recheado", 100);
    const orderDate = new Date("2024-01-01T12:00:00.000Z");
    const productOrderId = "123e4567-e89b-12d3-a456-426614174000";
    const productOrder = ProductOrder.rebuild(productOrderId, product, 20, orderDate, "opened");

    expect(productOrder).toBeInstanceOf(ProductOrder);
    if (productOrder instanceof Error) return;

    const inputDate = new Date("2024-01-02T12:00:00.000Z");
    const productInput = ProductInput.create(productOrder, 20, inputDate);

    expect(productInput).toBeInstanceOf(ProductInput);
    if (productInput instanceof Error) return;

    expect(productInput.getId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(productInput.getProductOrder()).toBe(productOrder);
    expect(productInput.getProductOrderId()).toBe(productOrder.getId());
    expect(productInput.getProductOrder().getId()).toBe(productOrderId);
    expect(productInput.getInputQuantity()).toBe(20);
    expect(productInput.getInputDate()).toBe(inputDate);
    expect(productInput.formatInputDate()).toBe("2024-01-02 12:00:00Z");
  });

  test("should reject a missing product order", () => {
    const result = ProductInput.create(null as any, 20, new Date());

    expect(result).toEqual(new Error("Product order is required"));
  });

  test("should reject a non-positive input quantity", () => {
    const result = ProductInput.create(
      {} as ProductOrder,
      0,
      new Date(),
    );

    expect(result).toEqual(new Error("Input quantity must be a positive integer"));
  });

  test("should reject a non-integer input quantity", () => {
    const result = ProductInput.create(
      {} as ProductOrder,
      1.5,
      new Date(),
    );

    expect(result).toEqual(new Error("Input quantity must be a positive integer"));
  });

  test("should reject a missing input date", () => {
    const result = ProductInput.create(
      {} as ProductOrder,
      20,
      null as any,
    );

    expect(result).toEqual(new Error("Invalid input date"));
  });

  test("should reject an invalid input date", () => {
    const result = ProductInput.create(
      {} as ProductOrder,
      20,
      new Date("invalid"),
    );

    expect(result).toEqual(new Error("Invalid input date"));
  });

  test("should only format a date suffix when it is at the end", () => {
    const product = Product.rebuild("1234567890123", "Biscoito Recheado", 100);
    const order = ProductOrder.create(
      product,
      20,
      new Date("2024-01-01T12:00:00.000Z"),
    );
    const dateWithSuffix = {
      getTime: () => 0,
      toISOString: () => "2024-01-02T12:00:00.000Zsuffix",
    } as unknown as Date;

    expect(order).toBeInstanceOf(ProductOrder);
    if (order instanceof Error) return;
    const result = ProductInput.create(order, 20, dateWithSuffix);

    expect(result).toBeInstanceOf(ProductInput);
    if (result instanceof Error) return;
    expect(result.formatInputDate()).toBe("2024-01-02 12:00:00.000Zsuffix");
  });

  test("should calculate the lead time in days", () => {
    const product = Product.rebuild("1234567890123", "Biscoito Recheado", 100);
    const order = ProductOrder.rebuild(
      "order-id",
      product,
      20,
      new Date("2024-01-01T12:00:00.000Z"),
      "closed",
    );
    const input = ProductInput.rebuild(
      "input-id",
      order,
      20,
      new Date("2024-01-04T00:00:00.000Z"),
    );

    expect(input.getLeadTime()).toBe(2.5);
  });
});
