import { InfrastructureError } from "../../../src/InfrastructureError";
import { Product } from "../../../src/entities/Product";
import type { ProductRepositoryInterface } from "../../../src/repositories/ProductRepository";
import { GetProductUsecase } from "../../../src/usecases/GetProductUsecase";

describe("GetProductUsecase tests", () => {

    test("should return a product successfully", () => {
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | null | InfrastructureError {
                return Product.rebuild(barcode, "Coca Cola 350ml", 10);
            }
            create(product: Product): void | InfrastructureError {
                return;
            }
            updateStock(barcode: string, quantityInStock: number): void | InfrastructureError {
                return;
            }
            findAll(): Product[] | InfrastructureError {
                return [];
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const getProductUsecase = new GetProductUsecase(productRepositoryMock);
        const result = getProductUsecase.execute("123456");

        expect(result).toEqual({
            barcode: "123456",
            name: "Coca Cola 350ml",
            quantityInStock: 10
        });
    });

    test("should return null when product is not found", () => {
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | null | InfrastructureError {
                return null;
            }
            create(product: Product): void | InfrastructureError {
                return;
            }
            updateStock(barcode: string, quantityInStock: number): void | InfrastructureError {
                return;
            }
            findAll(): Product[] | InfrastructureError {
                return [];
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const getProductUsecase = new GetProductUsecase(productRepositoryMock);
        const result = getProductUsecase.execute("123456");

        expect(result).toBeNull();
    });

    test("should return an Error when barcode is not provided", () => {
        let findByBarcodeCalled = false;

        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | null | InfrastructureError {
                findByBarcodeCalled = true;
                return null;
            }
            create(product: Product): void | InfrastructureError {
                return;
            }
            updateStock(barcode: string, quantityInStock: number): void | InfrastructureError {
                return;
            }
            findAll(): Product[] | InfrastructureError {
                return [];
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const getProductUsecase = new GetProductUsecase(productRepositoryMock);
        const result = getProductUsecase.execute("");

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe("Barcode is required");
        expect(findByBarcodeCalled).toBe(false);
    });

    test("should return an InfrastructureError when repository fails", () => {
        class ProductRepositoryMock implements ProductRepositoryInterface {
            findByBarcode(barcode: string): Product | null | InfrastructureError {
                return new InfrastructureError("Database error");
            }
            create(product: Product): void | InfrastructureError {
                return;
            }
            updateStock(barcode: string, quantityInStock: number): void | InfrastructureError {
                return;
            }
            findAll(): Product[] | InfrastructureError {
                return [];
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const getProductUsecase = new GetProductUsecase(productRepositoryMock);
        const result = getProductUsecase.execute("123456");

        expect(result).toBeInstanceOf(InfrastructureError);
        expect((result as InfrastructureError).message).toBe("Database error");
    });
});