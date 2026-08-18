import { Product } from "../../../src/entities/Product";
import { ProductInput } from "../../../src/entities/ProductInput";
import { ProductOrder } from "../../../src/entities/ProductOrder";
import { InfrastructureError } from "../../../src/InfrastructureError";
import type { ProductInputLeadTimeRepositoryInterface } from "../../../src/repositories/ProductInputRepository";
import { LeadTimeService } from "../../../src/services/LeadTimeService";

function inputWithLeadTime(id: string, days: number): ProductInput {
  const product = Product.rebuild("1234567890123", "Produto", 10);
  const orderDate = new Date("2024-01-01T00:00:00.000Z");
  const order = ProductOrder.rebuild(`order-${id}`, product, 10, orderDate, "closed");
  return ProductInput.rebuild(
    id,
    order,
    10,
    new Date(orderDate.getTime() + days * 24 * 60 * 60 * 1000),
  );
}

describe("LeadTimeService", () => {
  test("should calculate the average lead time for all product inputs", () => {
    let receivedBarcode = "";
    const repository: ProductInputLeadTimeRepositoryInterface = {
      findAllByProductBarcode(barcode) {
        receivedBarcode = barcode;
        return [inputWithLeadTime("1", 2), inputWithLeadTime("2", 4)];
      },
    };

    const result = new LeadTimeService(repository).getLeadTimeAvg("1234567890123");

    expect(receivedBarcode).toBe("1234567890123");
    expect(result).toBe(3);
  });

  test("should reject an empty barcode", () => {
    const repository: ProductInputLeadTimeRepositoryInterface = {
      findAllByProductBarcode: jest.fn(),
    };
    expect(new LeadTimeService(repository).getLeadTimeAvg(" ")).toEqual(
      new Error("Barcode is required"),
    );
    expect(repository.findAllByProductBarcode).not.toHaveBeenCalled();
  });

  test("should return an error when the product has no inputs", () => {
    const repository: ProductInputLeadTimeRepositoryInterface = {
      findAllByProductBarcode: () => [],
    };
    expect(new LeadTimeService(repository).getLeadTimeAvg("123")).toEqual(
      new Error("Product has no inputs"),
    );
  });

  test("should propagate infrastructure errors", () => {
    const error = new InfrastructureError("Database error");
    const repository: ProductInputLeadTimeRepositoryInterface = {
      findAllByProductBarcode: () => error,
    };
    expect(new LeadTimeService(repository).getLeadTimeAvg("123")).toBe(error);
  });
});
