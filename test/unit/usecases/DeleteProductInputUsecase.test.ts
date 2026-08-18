import { Product } from "../../../src/entities/Product";
import { ProductInput } from "../../../src/entities/ProductInput";
import { ProductOrder } from "../../../src/entities/ProductOrder";
import { InfrastructureError } from "../../../src/InfrastructureError";
import type { ProductInputDeletionRepositoryInterface } from "../../../src/repositories/ProductInputRepository";
import type { ProductOrderReopeningRepositoryInterface } from "../../../src/repositories/ProductOrderRepository";
import type { ProductStockRepositoryInterface } from "../../../src/repositories/ProductRepository";
import { DeleteProductInputUsecase } from "../../../src/usecases/DeleteProductInputUsecase";

function makeInput(stock = 20, inputQuantity = 5): ProductInput {
  const product = Product.rebuild("123", "Produto", stock);
  const order = ProductOrder.rebuild("order-id", product, 5, new Date("2024-01-01"), "closed");
  return ProductInput.rebuild("input-id", order, inputQuantity, new Date("2024-01-02"));
}

describe("DeleteProductInputUsecase", () => {
  test("should delete the input, decrement stock and reopen its order", () => {
    const calls: string[] = [];
    const inputRepository: ProductInputDeletionRepositoryInterface = {
      findById: () => makeInput(),
      delete: (id) => { calls.push(`delete:${id}`); },
    };
    const orderRepository: ProductOrderReopeningRepositoryInterface = {
      reopen: (id) => { calls.push(`reopen:${id}`); },
    };
    const stockRepository: ProductStockRepositoryInterface = {
      updateStock: (barcode, stock) => { calls.push(`stock:${barcode}:${stock}`); },
    };

    const result = new DeleteProductInputUsecase(
      inputRepository, orderRepository, stockRepository,
    ).execute("input-id");

    expect(result).toBeUndefined();
    expect(calls).toEqual(["delete:input-id", "stock:123:15", "reopen:order-id"]);
  });

  test("should reject an empty ID", () => {
    const inputRepository = { findById: jest.fn(), delete: jest.fn() };
    const usecase = new DeleteProductInputUsecase(
      inputRepository,
      { reopen: jest.fn() },
      { updateStock: jest.fn() },
    );
    expect(usecase.execute(" ")).toEqual(new Error("Product input ID is required"));
    expect(inputRepository.findById).not.toHaveBeenCalled();
  });

  test("should return an error when the input does not exist", () => {
    const usecase = new DeleteProductInputUsecase(
      { findById: () => null, delete: jest.fn() },
      { reopen: jest.fn() },
      { updateStock: jest.fn() },
    );
    expect(usecase.execute("missing")).toEqual(new Error("Product input not found"));
  });

  test("should not delete when stock would become negative", () => {
    const deleteInput = jest.fn();
    const usecase = new DeleteProductInputUsecase(
      { findById: () => makeInput(2, 5), delete: deleteInput },
      { reopen: jest.fn() },
      { updateStock: jest.fn() },
    );
    expect(usecase.execute("input-id")).toEqual(
      new Error("Cannot delete product input as it would result in negative stock"),
    );
    expect(deleteInput).not.toHaveBeenCalled();
  });

  test.each(["find", "delete", "stock", "reopen"])(
    "should propagate an infrastructure error from %s",
    (failurePoint) => {
      const error = new InfrastructureError("Database error");
      const usecase = new DeleteProductInputUsecase(
        {
          findById: () => failurePoint === "find" ? error : makeInput(),
          delete: () => failurePoint === "delete" ? error : undefined,
        },
        { reopen: () => failurePoint === "reopen" ? error : undefined },
        { updateStock: () => failurePoint === "stock" ? error : undefined },
      );
      expect(usecase.execute("input-id")).toBe(error);
    },
  );
});
