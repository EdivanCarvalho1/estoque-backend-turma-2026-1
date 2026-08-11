import { CreateProductController } from "../../src/controllers/CreateProductController";
import { Product } from "../../src/entities/Product";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { CreateProductUsecase } from "../../src/usecases/CreateProductUsecase";

describe("CreateProduct integration tests", () => {

    const sqliteConnection = new SqliteConnection("db/estoque-test.sqlite");
    const productRepository = new ProductRepository(sqliteConnection);
    const createProductUsecase = new CreateProductUsecase(productRepository);
    const createProductController = new CreateProductController(createProductUsecase);

    beforeEach(() => {
        const connection = sqliteConnection.getConnection();
        connection.exec("DELETE FROM product_inputs");
        connection.exec("DELETE FROM product_orders");
        connection.exec("DELETE FROM products");
    });

    test("should create a product successfully", async () => {

        const requestMock: any = {
            body: {
                barcode: '123456',
                name: 'Coca Cola 350ml'
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

        await createProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(201);
        expect(responseMock.data).toEqual({
            barcode: "123456",
            name: "Coca Cola 350ml",
            quantityInStock: 0
        });

        const verifyProduct = await productRepository.findByBarcode("123456");
        expect(verifyProduct).toBeInstanceOf(Product);
        if (verifyProduct instanceof Product) {
            expect(verifyProduct.getBarcode()).toBe("123456");
            expect(verifyProduct.getName()).toBe("Coca Cola 350ml");
            expect(verifyProduct.getQuantityInStock()).toBe(0);
        }

    });

    test("should return 400 if product exists", async () => {

        const connection = sqliteConnection.getConnection();
        connection.exec(`
            INSERT INTO products (barcode, name, quantity_in_stock) 
            VALUES ('123456', 'Coca Cola 350ml', 0);
        `);

        const requestMock: any = {
            body: {
                barcode: '123456',
                name: 'Coca Cola 350ml'
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

        await createProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ error: "Product with the same barcode already exists" });

    });

    test("should return 500 if the connection with the database fails", async () => {

        const sqliteConnectionLocal = new SqliteConnection("lalala.sqlite");
        const productRepositoryLocal = new ProductRepository(sqliteConnectionLocal);
        const createProductUsecaseLocal = new CreateProductUsecase(productRepositoryLocal);
        const createProductControllerLocal = new CreateProductController(createProductUsecaseLocal);

        const requestMock: any = {
            body: {
                barcode: '123456',
                name: 'Coca Cola 350ml'
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

        await createProductControllerLocal.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(500);
        expect(responseMock.data).toEqual({ error: "Database error" });

    });

});
