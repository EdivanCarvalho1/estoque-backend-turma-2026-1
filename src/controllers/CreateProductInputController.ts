import type { FastifyReply, FastifyRequest } from "fastify";
import { InfrastructureError } from "../InfrastructureError";
import type {
  CreateProductInputUsecaseInterface,
  CreateProductInputDTO,
} from "../usecases/CreateProductInputUsecase";


export class CreateProductInputController {
    constructor(private createProductInputUsecase: CreateProductInputUsecaseInterface) {}

    public async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
        if (!request.body || typeof request.body !== "object") {
            response.status(400).send({ error: "Invalid request body" });
            return;
        }

        const { productOrderId, inputQuantity, inputDate } = request.body as {
            productOrderId?: string;
            inputQuantity?: number;
            inputDate?: string;
        };

        if (!productOrderId) {
            response.status(400).send({ error: "Product order ID is required" });
            return;
        }

        if (inputQuantity === undefined) {
            response.status(400).send({ error: "Input quantity is required" });
            return;
        }

        if (!inputDate) {
            response.status(400).send({ error: "Input date is required" });
            return;
        }

        const parsedInputDate = new Date(inputDate);
        if (isNaN(parsedInputDate.getTime())) {
            response.status(400).send({ error: "Invalid input date format" });
            return;
        }

        const result = this.createProductInputUsecase.execute(
            productOrderId,
            inputQuantity as number,
            parsedInputDate,
        );

        if (result instanceof InfrastructureError) {
            response.status(500).send({ error: result.message });
            return;
        }

        if (result instanceof Error) {
            const statusCode = result.message === "Product order does not exist" ? 404 : 400;
            response.status(statusCode).send({ error: result.message });
            return;
        }

        response.status(201).send(this.toResponse(result));
    }

    private toResponse(result: CreateProductInputDTO) {
        const productOrder = result.productOrder;
        const product = productOrder.getProduct();

        return {
            id: result.id,
            inputQuantity: result.inputQuantity,
            inputDate: result.inputDate,
            productOrder: {
                id: productOrder.getId(),
                orderDate: productOrder.getOrderDate(),
                status: productOrder.getStatus(),
                product: {
                    barcode: product.getBarcode(),
                    name: product.getName(),
                    quantityInStock: product.getQuantityInStock(),
                },
            },
        };
    }
}
