import { InfrastructureError } from "../InfrastructureError";
import type { ProductRepositoryInterface } from "../repositories/ProductRepository";

export interface GetAllProductsDTO {
    barcode: string;
    name: string;
    quantityInStock: number;
}

export interface GetAllProductsUsecaseInterface {
    execute(): GetAllProductsDTO[] | InfrastructureError;
}

export class GetAllProductsUsecase implements GetAllProductsUsecaseInterface {
    private productRepository: ProductRepositoryInterface;

    constructor(productRepository: ProductRepositoryInterface) {
        this.productRepository = productRepository;
    }

    public execute(): GetAllProductsDTO[] | InfrastructureError {
        const products = this.productRepository.findAll();
        if (products instanceof InfrastructureError) {
            return new InfrastructureError(products.message);
        }

        return products.map(product => ({
            barcode: product.getBarcode(),
            name: product.getName(),
            quantityInStock: product.getQuantityInStock()
        }));
    }
}