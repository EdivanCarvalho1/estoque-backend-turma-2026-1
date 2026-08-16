import { InfrastructureError } from "../InfrastructureError";
import type { ProductInputDeletionRepositoryInterface } from "../repositories/ProductInputRepository";
import type { ProductOrderReopeningRepositoryInterface } from "../repositories/ProductOrderRepository";
import type { ProductStockRepositoryInterface } from "../repositories/ProductRepository";

export interface DeleteProductInputUsecaseInterface {
  execute(productInputId: string): void | Error;
}

export class DeleteProductInputUsecase implements DeleteProductInputUsecaseInterface {
  constructor(
    private readonly productInputRepository: ProductInputDeletionRepositoryInterface,
    private readonly productOrderRepository: ProductOrderReopeningRepositoryInterface,
    private readonly productStockRepository: ProductStockRepositoryInterface,
  ) {}

  public execute(productInputId: string): void | Error {
    if (!productInputId || productInputId.trim() === "") return new Error("Product input ID is required");

    const productInput = this.productInputRepository.findById(productInputId);
    if (productInput instanceof InfrastructureError) return productInput;
    if (!productInput) return new Error("Product input not found");

    const productOrder = productInput.getProductOrder();
    const product = productOrder.getProduct();
    const newStock = product.getQuantityInStock() - productInput.getInputQuantity();
    if (newStock < 0) return new Error("Cannot delete product input as it would result in negative stock");

    const deleteResult = this.productInputRepository.delete(productInputId);
    if (deleteResult instanceof InfrastructureError) return deleteResult;
    const stockResult = this.productStockRepository.updateStock(product.getBarcode(), newStock);
    if (stockResult instanceof InfrastructureError) return stockResult;
    const reopenResult = this.productOrderRepository.reopen(productOrder.getId());
    if (reopenResult instanceof InfrastructureError) return reopenResult;
  }
}
