import { GetAllProductsController } from "../../../src/controllers/GetAllProductsController";
import { InfrastructureError } from "../../../src/InfrastructureError";
import type { GetAllProductsDTO, GetAllProductsUsecaseInterface } from "../../../src/usecases/GetAllProductsUsecase";

describe('Testing GetAllProductsController', () => {

    test('should get all products successfully', async () => {
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

        class GetAllProductsUsecaseMock implements GetAllProductsUsecaseInterface {
            execute(): GetAllProductsDTO[] | InfrastructureError {
                return [
                    { barcode: "123456", name: "Test Product 1", quantityInStock: 10 },
                    { barcode: "789012", name: "Test Product 2", quantityInStock: 5 }
                ];
            }
        }

        const getAllProductsUsecaseMock = new GetAllProductsUsecaseMock();
        const getAllProductsController = new GetAllProductsController(getAllProductsUsecaseMock);
        await getAllProductsController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(200);
        expect(responseMock.data).toEqual([
            { barcode: "123456", name: "Test Product 1", quantityInStock: 10 },
            { barcode: "789012", name: "Test Product 2", quantityInStock: 5 }
        ]);
    });

    test('should return an error 500 if the usecase returns an InfrastructureError', async () => {
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

        class GetAllProductsUsecaseMock implements GetAllProductsUsecaseInterface {
            execute(): GetAllProductsDTO[] | InfrastructureError {
                return new InfrastructureError("Database connection failed");
            }
        }

        const getAllProductsUsecaseMock = new GetAllProductsUsecaseMock();
        const getAllProductsController = new GetAllProductsController(getAllProductsUsecaseMock);
        await getAllProductsController.handle(requestMock, responseMock);

        expect(responseMock.statusCode).toBe(500);
        expect(responseMock.data).toEqual({ error: "Database connection failed" });
    });

});