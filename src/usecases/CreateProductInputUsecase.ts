import { ProductInput } from "../entities/ProductInput";
import { Product } from "../entities/Product";
import { ProductOrder } from "../entities/ProductOrder";
import { InfrastructureError } from "../InfrastructureError";
import type { ProductInputRepositoryInterface } from "../repositories/ProductInputRepository";
import type { ProductOrderRepositoryInterface } from "../repositories/ProductOrderRepository";
import type { ProductStockRepositoryInterface } from "../repositories/ProductRepository";

export interface CreateProductInputDTO {
  id: string;
  productOrder: ProductOrder;
  inputQuantity: number;
  inputDate: Date;
}

export interface CreateProductInputUsecaseInterface {
  execute(
    productOrderId: string,
    inputQuantity: number,
    inputDate: Date,
  ): CreateProductInputDTO | Error;
}

export class CreateProductInputUsecase implements CreateProductInputUsecaseInterface {
  constructor(
    private productOrderRepository: ProductOrderRepositoryInterface,
    private productInputRepository: ProductInputRepositoryInterface,
    private productStockRepository?: ProductStockRepositoryInterface,
  ) {}

  execute(
    productOrderId: string,
    inputQuantity: number,
    inputDate: Date,
  ): CreateProductInputDTO | Error {
    const productOrderResult = this.productOrderRepository.findById(productOrderId);

    if (productOrderResult instanceof InfrastructureError) {
      return productOrderResult;
    }

    if (!(productOrderResult instanceof ProductOrder)) {
      return new Error("Product order does not exist");
    }

    if (productOrderResult.getStatus() !== "opened") {
      return new Error("Product order is not in opened status");
    }

    if (inputDate < productOrderResult.getOrderDate()) {
      return new Error("Input date cannot be before the product order date");
    }

    const productInput = ProductInput.create(
      productOrderResult,
      inputQuantity,
      inputDate,
    );

    if (productInput instanceof Error) {
      return productInput;
    }

    const createResult = this.productInputRepository.create(productInput);

    if (createResult instanceof InfrastructureError) {
      return createResult;
    }

    let resultProductOrder = productOrderResult;
    if (this.productStockRepository) {
      const product = productOrderResult.getProduct();
      const newStock = product.getQuantityInStock() + inputQuantity;
      const updateStockResult = this.productStockRepository.updateStock(
        product.getBarcode(),
        newStock,
      );

      if (updateStockResult instanceof InfrastructureError) {
        return updateStockResult;
      }

      const closeResult = this.productOrderRepository.close(
        productOrderResult.getId(),
      );
      if (closeResult instanceof InfrastructureError) {
        return closeResult;
      }

      resultProductOrder = ProductOrder.rebuild(
        productOrderResult.getId(),
        Product.rebuild(product.getBarcode(), product.getName(), newStock),
        productOrderResult.getOrderQuantity(),
        productOrderResult.getOrderDate(),
        "closed",
      );
    }

    return {
      id: productInput.getId(),
      productOrder: resultProductOrder,
      inputQuantity: productInput.getInputQuantity(),
      inputDate: productInput.getInputDate(),
    };
  }
}
