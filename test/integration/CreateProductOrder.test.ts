import { CreateProductOrderController } from "../../src/controllers/CreateProductOrderController";
import { Product } from "../../src/entities/Product";
import { ProductOrderRepository } from "../../src/repositories/ProductOrderRepository";
import { ProductRepository } from "../../src/repositories/ProductRepository";
import { SqliteConnection } from "../../src/repositories/SqliteConnection";
import { CreateProductOrderUsecase } from "../../src/usecases/CreateProductOrderUsecase";

describe("CreateProductOrder integration tests", () => {

    const sqliteConnection = new SqliteConnection("db/estoque-test.sqlite");
    const productRepository = new ProductRepository(sqliteConnection);
    const productOrderRepository = new ProductOrderRepository(sqliteConnection);
    const createProductOrderUsecase = new CreateProductOrderUsecase(productRepository, productOrderRepository);
    const createProductOrderController = new CreateProductOrderController(createProductOrderUsecase);

    beforeEach(() => {
        const connection = sqliteConnection.getConnection();
        connection.exec("DELETE FROM product_inputs");
        connection.exec("DELETE FROM product_orders");
        connection.exec("DELETE FROM products");
    });

    test("should create a product order successfully", async () => {

        const product = Product.rebuild('123456', 'Coca Cola 350ml', 100);
        productRepository.create(product);

        const orderDate = new Date();

        const requestMock: any = {
            body: {
                barcode: '123456',
                orderQuantity: 10,
                orderDate: orderDate.toISOString(),
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

        await createProductOrderController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(201);
        expect(responseMock.data).toHaveProperty('id', expect.any(String));
        expect(responseMock.data).toHaveProperty('orderQuantity', 10);
        expect(responseMock.data).toHaveProperty('orderDate', orderDate);
        expect(responseMock.data).toHaveProperty('status', 'opened');
        expect(responseMock.data).toHaveProperty('product.barcode', '123456');
        expect(responseMock.data).toHaveProperty('product.name', 'Coca Cola 350ml');
        expect(responseMock.data).toHaveProperty('product.quantityInStock', 100);

    });

    test("should return 400 if request body is not present", async () => {

        const requestMock: any = {
            body: null
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

        await createProductOrderController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ error: "Invalid request body" });

    });

    test("should return 500 if the connection with the database fails", async () => {

        const sqliteConnectionLocal = new SqliteConnection("lalala.sqlite");
        const productRepositoryLocal = new ProductRepository(sqliteConnectionLocal);
        const productOrderRepositoryLocal = new ProductOrderRepository(sqliteConnectionLocal);
        const createProductOrderUsecaseLocal = new CreateProductOrderUsecase(productRepositoryLocal, productOrderRepositoryLocal);
        const createProductOrderControllerLocal = new CreateProductOrderController(createProductOrderUsecaseLocal);

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

        await createProductOrderControllerLocal.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(500);
        expect(responseMock.data).toEqual({ error: "Database error" });

    });

});
