import { CreateProductController } from "../../../src/controllers/CreateProductController";
import { InfrastructureError } from "../../../src/InfrastructureError";
import type { CreateProductDTO, CreateProductUsecaseInterface } from "../../../src/usecases/CreateProductUsecase";

describe('Testing CreateProductController', () => {

    test('should create a product successfully', async () => {

        const requestMock: any = {
            body: {
                barcode: '123456',
                name: 'Test Product'
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

        class CreateProductUseCaseMock implements CreateProductUsecaseInterface {
            execute(barcode: string, name: string): CreateProductDTO | Error {
                return { barcode: "123456", name: "Test Product", quantityInStock: 0 };
            }
        }

        const createProductUseCaseMock = new CreateProductUseCaseMock();
        const createProductController = new CreateProductController(createProductUseCaseMock);

        await createProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(201);
        expect(responseMock.data).toEqual({ barcode: "123456", name: "Test Product", quantityInStock: 0 });

    });

    test('should return an error 400 if the body is not present', async () => {

        const requestMock: any = {

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

        class CreateProductUseCaseMock implements CreateProductUsecaseInterface {
            execute(barcode: string, name: string): CreateProductDTO | Error {
                return { barcode: "123456", name: "Test Product", quantityInStock: 0 };
            }
        }

        const createProductUseCaseMock = new CreateProductUseCaseMock();
        const createProductController = new CreateProductController(createProductUseCaseMock);

        await createProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ error: "Invalid request body" });

    });

    test('should return an error 400 if the body is not an object', async () => {
        const requestMock: any = { body: 'invalid body' };
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

        class CreateProductUseCaseMock implements CreateProductUsecaseInterface {
            execute(): CreateProductDTO | Error {
                return new Error("This should not be called");
            }
        }

        const controller = new CreateProductController(new CreateProductUseCaseMock());

        await controller.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ error: "Invalid request body" });
    });

    test('should return an error 500 if receive an InfrastructureError from usecase', async () => {

        const requestMock: any = {
            body: {
                barcode: '123456',
                name: 'Test Product'
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

        class CreateProductUseCaseMock implements CreateProductUsecaseInterface {
            execute(barcode: string, name: string): CreateProductDTO | Error {
                return new InfrastructureError("Database connection failed");
            }
        }

        const createProductUseCaseMock = new CreateProductUseCaseMock();
        const createProductController = new CreateProductController(createProductUseCaseMock);

        await createProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(500);
        expect(responseMock.data).toEqual({ error: "Database connection failed" });

    });

    test('should return an error 400 if receive an Error from usecase', async () => {

        const requestMock: any = {
            body: {
                barcode: '123456',
                name: 'Test Product'
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

        class CreateProductUseCaseMock implements CreateProductUsecaseInterface {
            execute(barcode: string, name: string): CreateProductDTO | Error {
                return new Error("Barcode already exists");
            }
        }

        const createProductUseCaseMock = new CreateProductUseCaseMock();
        const createProductController = new CreateProductController(createProductUseCaseMock);

        await createProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ error: "Barcode already exists" });

    });

});
