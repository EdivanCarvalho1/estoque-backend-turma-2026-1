import { DeleteProductInputController } from "../../../src/controllers/DeleteProductInputController";
import { InfrastructureError } from "../../../src/InfrastructureError";
import type { DeleteProductInputUsecaseInterface } from "../../../src/usecases/DeleteProductInputUsecase";

function createResponseMock() {
  return {
    statusCode: 0,
    data: undefined as unknown,
    status(code: number) { this.statusCode = code; return this; },
    send(data: unknown) { this.data = data; return this; },
  };
}

describe("DeleteProductInputController", () => {
  test.each([
    [undefined, 200, { message: "Product input deleted successfully" }],
    [new Error("Product input not found"), 404, { error: "Product input not found" }],
    [new Error("Invalid deletion"), 400, { error: "Invalid deletion" }],
    [new InfrastructureError("Database error"), 500, { error: "Database error" }],
  ])("should map the usecase result to HTTP", async (result, status, body) => {
    const usecase: DeleteProductInputUsecaseInterface = { execute: () => result };
    const response = createResponseMock();
    await new DeleteProductInputController(usecase).handle(
      { params: { productInputId: "input-id" } } as any,
      response as any,
    );
    expect(response.statusCode).toBe(status);
    expect(response.data).toEqual(body);
  });

  test("should pass the route parameter to the usecase", async () => {
    const execute = jest.fn();
    const response = createResponseMock();
    await new DeleteProductInputController({ execute }).handle(
      { params: { productInputId: "input-id" } } as any,
      response as any,
    );
    expect(execute).toHaveBeenCalledWith("input-id");
  });

  test("should pass an empty ID when the route parameter is absent", async () => {
    const execute = jest.fn(() => new Error("Product input ID is required"));
    const response = createResponseMock();
    await new DeleteProductInputController({ execute }).handle(
      { params: {} } as any,
      response as any,
    );
    expect(execute).toHaveBeenCalledWith("");
    expect(response.statusCode).toBe(400);
  });
});
