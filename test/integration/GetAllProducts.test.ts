import { CreateProductController } from "../../src/controllers/CreateProductController";
import { GetAllProductsController } from "../../src/controllers/GetAllProductsController";
import { Product } from "../../src/entities/Product";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { CreateProductUsecase } from "../../src/usecases/CreateProductUsecase";
import { GetAllProductsUsecase } from "../../src/usecases/GetAllProductsUsecase";

describe("GetAllProducts integration tests", () => {

    const sqliteConnection = new SqliteConnection("db/estoque-test.sqlite");
    const productRepository = new ProductRepository(sqliteConnection);
    const getAllProductsUsecase = new GetAllProductsUsecase(productRepository);
    const getAllProductsController = new GetAllProductsController(getAllProductsUsecase);

    beforeEach(() => {
        const connection = sqliteConnection.getConnection();
        connection.exec("DELETE FROM product_inputs");
        connection.exec("DELETE FROM product_orders");
        connection.exec("DELETE FROM products");
    });

    test("should get all products successfully", async () => {

        productRepository.create(Product.rebuild("123456", "Coca Cola 350ml", 0));
        productRepository.create(Product.rebuild("789012", "Pepsi 350ml", 0));


        const requestMock: any = { };

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

        await getAllProductsController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(200);
        expect(responseMock.data).toEqual([
            { barcode: "123456", name: "Coca Cola 350ml", quantityInStock: 0 },
            { barcode: "789012", name: "Pepsi 350ml", quantityInStock: 0 }
        ]);
    });

    test("should return 500 if the connection with the database fails", async () => {

        const sqliteConnectionLocal = new SqliteConnection("lalala.sqlite");
        const productRepositoryLocal = new ProductRepository(sqliteConnectionLocal);
        const getAllProductsUsecaseLocal = new GetAllProductsUsecase(productRepositoryLocal);
        const getAllProductsControllerLocal = new GetAllProductsController(getAllProductsUsecaseLocal);

        const requestMock: any = { };

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

        await getAllProductsControllerLocal.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(500);
        expect(responseMock.data).toEqual({ error: "Database error" });
    });

});