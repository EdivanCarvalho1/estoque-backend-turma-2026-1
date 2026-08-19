import { Product } from "../../../src/entities/Product";
import { InfrastructureError } from "../../../src/InfrastructureError";
import type { ProductRepositoryInterface } from "../../../src/repositories/ProductRepository"
import { GetAllProductsUsecase } from "../../../src/usecases/GetAllProductsUsecase";

describe("GetAllProductsUsecase tests", () => {

    test("should return all products", async () => {
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findAll(): Product[] | InfrastructureError {
                return [
                    Product.rebuild("123456789", "Coca Cola 2L", 10),
                    Product.rebuild("987654321", "Pepsi 2L", 5)
                ];
            }
            create(product: Product): void | InfrastructureError {
                return;
            }
            findByBarcode(barcode: string): Product | null | InfrastructureError {
                return null;
            }
            updateStock(barcode: string, quantityInStock: number): void | InfrastructureError {
                return;
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const getAllProductsUsecase = new GetAllProductsUsecase(productRepositoryMock);
        const result = await getAllProductsUsecase.execute();
        expect(result).toEqual([
            Product.rebuild("123456789", "Coca Cola 2L", 10),
            Product.rebuild("987654321", "Pepsi 2L", 5)
        ]);
    });

    test("should return an InfrastructureError when repository fails", async () => {
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findAll(): Product[] | InfrastructureError {
                return new InfrastructureError("Database connection failed");
            }
            create(product: Product): void | InfrastructureError {
                return;
            }
            findByBarcode(barcode: string): Product | null | InfrastructureError {
                return null;
            }
            updateStock(barcode: string, quantityInStock: number): void | InfrastructureError {
                return;
            }            
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const getAllProductsUsecase = new GetAllProductsUsecase(productRepositoryMock);
        const result = await getAllProductsUsecase.execute();
        expect(result).toBeInstanceOf(InfrastructureError);
        expect((result as InfrastructureError).message).toBe("Database connection failed");
    });
});