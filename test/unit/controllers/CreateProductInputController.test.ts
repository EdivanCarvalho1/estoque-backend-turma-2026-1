import { CreateProductInputController } from "../../../src/controllers/CreateProductInputController";
import { InfrastructureError } from "../../../src/InfrastructureError";
import { Product } from "../../../src/entities/Product";
import { ProductOrder } from "../../../src/entities/ProductOrder";
import type {
  CreateProductInputDTO,
  CreateProductInputUsecaseInterface,
} from "../../../src/usecases/CreateProductInputUsecase";

function createResponseMock() {
  return {
    statusCode: 0,
    data: null as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(data: unknown) {
      this.data = data;
      return this;
    },
  };
}

describe("CreateProductInputController", () => {
  const product = Product.rebuild("123456", "Coca Cola 350ml", 100);
  const productOrder = ProductOrder.rebuild(
    "order-id",
    product,
    10,
    new Date("2024-01-01T12:00:00.000Z"),
    "closed",
  );
  const result: CreateProductInputDTO = {
    id: "input-id",
    productOrder,
    inputQuantity: 10,
    inputDate: new Date("2024-01-02T12:00:00.000Z"),
  };

  test("should delegate creation and return 201", async () => {
    const calls: unknown[][] = [];
    const usecase: CreateProductInputUsecaseInterface = {
      execute(...args) {
        calls.push(args);
        return result;
      },
    };
    const response = createResponseMock();

    await new CreateProductInputController(usecase).handle(
      {
        body: {
          productOrderId: "order-id",
          inputQuantity: 10,
          inputDate: "2024-01-02T12:00:00.000Z",
        },
      } as any,
      response as any,
    );

    expect(calls).toEqual([
      ["order-id", 10, new Date("2024-01-02T12:00:00.000Z")],
    ]);
    expect(response.statusCode).toBe(201);
    expect(response.data).toEqual({
      id: "input-id",
      inputQuantity: 10,
      inputDate: result.inputDate,
      productOrder: {
        id: "order-id",
        orderDate: productOrder.getOrderDate(),
        status: "closed",
        product: {
          barcode: "123456",
          name: "Coca Cola 350ml",
          quantityInStock: 100,
        },
      },
    });
  });

  test("should return 400 when the body is missing", async () => {
    let called = false;
    const usecase: CreateProductInputUsecaseInterface = {
      execute() {
        called = true;
        return result;
      },
    };
    const response = createResponseMock();

    await new CreateProductInputController(usecase).handle(
      {} as any,
      response as any,
    );

    expect(called).toBe(false);
    expect(response.statusCode).toBe(400);
    expect(response.data).toEqual({ error: "Invalid request body" });
  });

  test("should map infrastructure errors to 500", async () => {
    const usecase: CreateProductInputUsecaseInterface = {
      execute() {
        return new InfrastructureError("Database error");
      },
    };
    const response = createResponseMock();

    await new CreateProductInputController(usecase).handle(
      {
        body: {
          productOrderId: "order-id",
          inputQuantity: 10,
          inputDate: "2024-01-02T12:00:00.000Z",
        },
      } as any,
      response as any,
    );

    expect(response.statusCode).toBe(500);
    expect(response.data).toEqual({ error: "Database error" });
  });
});
