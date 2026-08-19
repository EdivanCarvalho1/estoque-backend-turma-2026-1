import { InfrastructureError } from "../InfrastructureError";
import type { ProductRepositoryInterface } from "../repositories/ProductRepository";

export interface GetProductDTO {
    barcode: string;
    name: string;
    quantityInStock: number;
}

export interface GetProductUsecaseInterface {
    execute(barcode: string): GetProductDTO | null | Error;
}

export class GetProductUsecase implements GetProductUsecaseInterface {
    private productRepository: ProductRepositoryInterface;

    constructor(productRepository: ProductRepositoryInterface) {
        this.productRepository = productRepository;
    }

    public execute(barcode: string): GetProductDTO | null | Error {
        if (!barcode) {
            return new Error("Barcode is required");
        }

        const product = this.productRepository.findByBarcode(barcode);
        if (product instanceof InfrastructureError) {
            return new InfrastructureError(product.message);
        }
        
        if (!product) {
            return null;
        }

        return {
            barcode: product.getBarcode(),
            name: product.getName(),
            quantityInStock: product.getQuantityInStock()
        };
    }
}