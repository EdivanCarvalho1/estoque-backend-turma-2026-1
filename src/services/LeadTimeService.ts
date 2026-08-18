import { InfrastructureError } from "../InfrastructureError";
import type { ProductInputLeadTimeRepositoryInterface } from "../repositories/ProductInputRepository";

export class LeadTimeService {
  constructor(private readonly productInputRepository: ProductInputLeadTimeRepositoryInterface) {}

  public getLeadTimeAvg(barcode: string): number | Error {
    if (!barcode || barcode.trim() === "") return new Error("Barcode is required");

    const productInputs = this.productInputRepository.findAllByProductBarcode(barcode);
    if (productInputs instanceof InfrastructureError) return productInputs;
    if (productInputs.length === 0) return new Error("Product has no inputs");

    const total = productInputs.reduce((sum, input) => sum + input.getLeadTime(), 0);
    return total / productInputs.length;
  }

}
