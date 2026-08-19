import type { FastifyReply, FastifyRequest } from "fastify";
import type { GetAllProductsUsecaseInterface } from "../usecases/GetAllProductsUsecase";
import { InfrastructureError } from "../InfrastructureError";
import type { GetProductUsecaseInterface } from "../usecases/GetProductUsecase";

export class GetProductController {

    private getProductUsecase: GetProductUsecaseInterface;

    constructor(getProductUsecase: GetProductUsecaseInterface) {
        this.getProductUsecase = getProductUsecase;
    }

    async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        if (!request.params || typeof request.params !== "object") {
            reply.status(400).send({ error: "Invalid request parameters" });
            return;
        }
                
        const { barcode } = request.params as { barcode: string };
        const result = this.getProductUsecase.execute(barcode);

        if (result instanceof InfrastructureError) {
            reply.status(500).send({ error: result.message });
            return;
        }

        if (result instanceof Error) {
            reply.status(400).send({ error: result.message });
            return;
        }

        if (result === null) {
            reply.status(404).send({ error: "Product not found" });
            return;
        }
        reply.status(200).send(result);
    }
}