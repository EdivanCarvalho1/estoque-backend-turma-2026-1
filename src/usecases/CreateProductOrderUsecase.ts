import { Product } from "../entities/Product";
import { ProductOrder } from "../entities/ProductOrder";
import { InfrastructureError } from "../InfrastructureError";
import type { ProductRepositoryInterface } from "../repositories/ProductRepository";
import type { ProductOrderRepositoryInterface } from "../repositories/ProductOrderRepository";

export interface ProductDTO {
    barcode: string;
    name: string;
    quantityInStock: number;
}

export interface CreateProductOrderDTO {
    id: string;
    product: ProductDTO;
    orderQuantity: number;
    orderDate: Date;
    status: string;
}

export interface CreateProductOrderUsecaseInterface {
    execute(barcode: string, orderQuantity: number, orderDate: Date): CreateProductOrderDTO | Error;
}

export class CreateProductOrderUsecase implements CreateProductOrderUsecaseInterface {
    constructor(
        private readonly productRepository: ProductRepositoryInterface,
        private readonly productOrderRepository: ProductOrderRepositoryInterface,
    ) {}

    execute(barcode: string, orderQuantity: number, orderDate: Date): CreateProductOrderDTO | Error {
        const product = this.productRepository.findByBarcode(barcode);
        if (product instanceof InfrastructureError) {
            return product;
        }
        if (!(product instanceof Product)) {
            return new Error("Product does not exist");
        }

        const productOrder = ProductOrder.create(product, orderQuantity, orderDate);
        if (productOrder instanceof Error) {
            return productOrder;
        }

        const createResult = this.productOrderRepository.create(productOrder);
        if (createResult instanceof InfrastructureError) {
            return createResult;
        }

        return this.toDTO(productOrder);
    }

    private toDTO(productOrder: ProductOrder): CreateProductOrderDTO {
        const product = productOrder.getProduct();
        return {
            id: productOrder.getId(),
            product: {
                barcode: product.getBarcode(),
                name: product.getName(),
                quantityInStock: product.getQuantityInStock(),
            },
            orderQuantity: productOrder.getOrderQuantity(),
            orderDate: productOrder.getOrderDate(),
            status: productOrder.getStatus(),
        };
    }
}
