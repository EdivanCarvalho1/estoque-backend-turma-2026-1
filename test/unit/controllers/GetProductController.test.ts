import { GetProductController } from "../../../src/controllers/GetProductController";
import { InfrastructureError } from "../../../src/InfrastructureError";
import type { GetProductDTO, GetProductUsecaseInterface } from "../../../src/usecases/GetProductUsecase";

describe("Testing GetProductController", () => {

    test("should get a product successfully", async () => {
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

        class GetProductUsecaseMock implements GetProductUsecaseInterface {
            execute(barcode: string): GetProductDTO | null | Error {
                return { barcode: "123456", name: "Test Product", quantityInStock: 10 };
            }
        }

        const getProductUsecaseMock = new GetProductUsecaseMock();
        const getProductController = new GetProductController(getProductUsecaseMock);
        await getProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(200);
        expect(responseMock.data).toEqual({
            barcode: "123456",
            name: "Test Product",
            quantityInStock: 10
        });
    });

    test("should return an error 400 if the params are not present", async () => {
        const requestMock: any = {};

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

        class GetProductUsecaseMock implements GetProductUsecaseInterface {
            execute(barcode: string): GetProductDTO | null | Error {
                return new Error("This should not be called");
            }
        }

        const getProductUsecaseMock = new GetProductUsecaseMock();
        const getProductController = new GetProductController(getProductUsecaseMock);
        await getProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ error: "Invalid request parameters" });
    });

    test("should return an error 400 if the params are not an object", async () => {
        const requestMock: any = { params: "invalid params" };

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

        class GetProductUsecaseMock implements GetProductUsecaseInterface {
            execute(barcode: string): GetProductDTO | null | Error {
                return new Error("This should not be called");
            }
        }

        const getProductUsecaseMock = new GetProductUsecaseMock();
        const getProductController = new GetProductController(getProductUsecaseMock);
        await getProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ error: "Invalid request parameters" });
    });

    test("should return an error 500 if the usecase returns an InfrastructureError", async () => {
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

        class GetProductUsecaseMock implements GetProductUsecaseInterface {
            execute(barcode: string): GetProductDTO | null | Error {
                return new InfrastructureError("Database connection failed");
            }
        }

        const getProductUsecaseMock = new GetProductUsecaseMock();
        const getProductController = new GetProductController(getProductUsecaseMock);
        await getProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(500);
        expect(responseMock.data).toEqual({ error: "Database connection failed" });
    });

    test("should return an error 400 if the usecase returns an Error", async () => {
        const requestMock: any = {
            params: {
                barcode: ""
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

        class GetProductUsecaseMock implements GetProductUsecaseInterface {
            execute(barcode: string): GetProductDTO | null | Error {
                return new Error("Barcode is required");
            }
        }

        const getProductUsecaseMock = new GetProductUsecaseMock();
        const getProductController = new GetProductController(getProductUsecaseMock);
        await getProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(400);
        expect(responseMock.data).toEqual({ error: "Barcode is required" });
    });

    test("should return an error 404 if the product is not found", async () => {
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

        class GetProductUsecaseMock implements GetProductUsecaseInterface {
            execute(barcode: string): GetProductDTO | null | Error {
                return null;
            }
        }

        const getProductUsecaseMock = new GetProductUsecaseMock();
        const getProductController = new GetProductController(getProductUsecaseMock);
        await getProductController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(404);
        expect(responseMock.data).toEqual({ error: "Product not found" });
    });
});