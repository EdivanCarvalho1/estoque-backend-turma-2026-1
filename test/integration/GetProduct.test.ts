import { GetProductController } from "../../src/controllers/GetProductController";
import { Product } from "../../src/entities/Product";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { GetProductUsecase } from "../../src/usecases/GetProductUsecase";

describe("GetProduct integration tests", () => {

    const sqliteConnection = new SqliteConnection("db/estoque-test.sqlite");
    const productRepository = new ProductRepository(sqliteConnection);
    const getProductUsecase = new GetProductUsecase(productRepository);
    const getProductController = new GetProductController(getProductUsecase);

    beforeEach(() => {
        const connection = sqliteConnection.getConnection();
        connection.exec("DELETE FROM product_inputs");
        connection.exec("DELETE FROM product_orders");
        connection.exec("DELETE FROM products");
    });

    test("should get a product successfully", async () => {
        productRepository.create(Product.rebuild("123456", "Coca Cola 350ml", 10));

        const requestMock: any = {
            params: {
                barcode: "123456"
            }
        };

        const responseMock: any = {
            statusCode: 0,
            data: null,
            status(code: number) {
                this.statusCode = code;
                return this;
            },
            send(data: any) {
                this.data = data;
                return this;
            }
        };

        await getProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(200);
        expect(responseMock.data).toEqual({
            barcode: "123456",
            name: "Coca Cola 350ml",
            quantityInStock: 10
        });
    });

    test("should return 404 if product is not found", async () => {
        const requestMock: any = {
            params: {
                barcode: "123456"
            }
        };

        const responseMock: any = {
            statusCode: 0,
            data: null,
            status(code: number) {
                this.statusCode = code;
                return this;
            },
            send(data: any) {
                this.data = data;
                return this;
            }
        };

        await getProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(404);
        expect(responseMock.data).toEqual({ error: "Product not found" });
    });

    test("should return 500 if the connection with the database fails", async () => {
        const sqliteConnectionLocal = new SqliteConnection("lalala.sqlite");
        const productRepositoryLocal = new ProductRepository(sqliteConnectionLocal);
        const getProductUsecaseLocal = new GetProductUsecase(productRepositoryLocal);
        const getProductControllerLocal = new GetProductController(getProductUsecaseLocal);

        const requestMock: any = {
            params: {
                barcode: "123456"
            }
        };

        const responseMock: any = {
            statusCode: 0,
            data: null,
            status(code: number) {
                this.statusCode = code;
                return this;
            },
            send(data: any) {
                this.data = data;
                return this;
            }
        };

        await getProductControllerLocal.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(500);
        expect(responseMock.data).toEqual({ error: "Database error" });
    });
});