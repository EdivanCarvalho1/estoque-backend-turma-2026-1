import { Product } from "../../../src/entities/Product";
import { InfrastructureError } from "../../../src/InfrastructureError";
import type { ProductRepositoryInterface } from "../../../src/repositories/ProductRepository";
import { CreateProductUsecase } from "../../../src/usecases/CreateProductUsecase";
import type { CreateProductDTO } from "../../../src/usecases/CreateProductUsecase";

describe("CreateProductUsecase tests", () => {

    test("should create a product successfully", async () => {

        class ProductRepositoryMock implements ProductRepositoryInterface {
            create(product: Product): void | InfrastructureError {
                return;
            }
            findByBarcode(barcode: string): Product | null | InfrastructureError {
                return null;
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const createProductUsecase = new CreateProductUsecase(productRepositoryMock);

        const barcode = "123456789";
        const name = "Coca Cola 2L";

        const result = createProductUsecase.execute(barcode, name);

        expect(result).not.toBeInstanceOf(Error);
        expect(result).toEqual({ barcode: barcode, name: name, quantityInStock: 0 } as CreateProductDTO);
    });

    test("should return an InfrastructureError when the method findByBarcode return an error", async () => {

        class ProductRepositoryMock implements ProductRepositoryInterface {
            create(product: Product): void | InfrastructureError {
                return new InfrastructureError("Database error");
            }
            findByBarcode(barcode: string): Product | null | InfrastructureError {
                return new InfrastructureError("Database error");;
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const createProductUsecase = new CreateProductUsecase(productRepositoryMock);

        const barcode = "123456789";
        const name = "Coca Cola 2L";

        const result = createProductUsecase.execute(barcode, name);

        expect(result).toBeInstanceOf(InfrastructureError);
        expect((result as InfrastructureError).message).toBe("Database error");

    });

    test("should stop when finding a product returns an InfrastructureError", () => {
        const databaseError = new InfrastructureError("Find failed");
        let createCalled = false;

        class ProductRepositoryMock implements ProductRepositoryInterface {
            create(product: Product): void | InfrastructureError {
                createCalled = true;
                return;
            }
            findByBarcode(barcode: string): Product | null | InfrastructureError {
                return databaseError;
            }
        }

        const usecase = new CreateProductUsecase(new ProductRepositoryMock());

        const result = usecase.execute("123456789", "Coca Cola 2L");

        expect(result).toBe(databaseError);
        expect(createCalled).toBe(false);
    });

    test("should return an Error when the product already exists", async () => {

        class ProductRepositoryMock implements ProductRepositoryInterface {
            create(product: Product): void | InfrastructureError {
                return;
            }
            findByBarcode(barcode: string): Product | null | InfrastructureError {
                return Product.rebuild(barcode, "Existing Product", 10);
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const createProductUsecase = new CreateProductUsecase(productRepositoryMock);

        const barcode = "123456789";
        const name = "Coca Cola 2L";

        const result = createProductUsecase.execute(barcode, name);

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe("Product with the same barcode already exists");

    });

    test("should return an Error when the entity returns an error", async () => {

        class ProductRepositoryMock implements ProductRepositoryInterface {
            create(product: Product): void | InfrastructureError {
                return;
            }
            findByBarcode(barcode: string): Product | null | InfrastructureError {
                return null;
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const createProductUsecase = new CreateProductUsecase(productRepositoryMock);

        const barcode = "123456789";
        const name = "";

        const result = createProductUsecase.execute(barcode, name);

        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe("Name is required");
    });

    test("should return an InfrastructureError when the method create return an error", async () => {

        class ProductRepositoryMock implements ProductRepositoryInterface {
            create(product: Product): void | InfrastructureError {
                return new InfrastructureError("Database error");
            }
            findByBarcode(barcode: string): Product | null | InfrastructureError {
                return null;
            }
        }

        const productRepositoryMock = new ProductRepositoryMock();
        const createProductUsecase = new CreateProductUsecase(productRepositoryMock);

        const barcode = "123456789";
        const name = "Coca Cola 2L";

        const result = createProductUsecase.execute(barcode, name);

        expect(result).toBeInstanceOf(InfrastructureError);
        expect((result as InfrastructureError).message).toBe("Database error");
    });
});
