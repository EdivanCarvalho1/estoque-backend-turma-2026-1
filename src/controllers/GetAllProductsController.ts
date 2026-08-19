import type { FastifyReply, FastifyRequest } from "fastify";
import type { GetAllProductsUsecaseInterface } from "../usecases/GetAllProductsUsecase";
import { InfrastructureError } from "../InfrastructureError";

export class GetAllProductsController {

    private getAllProductsUsecase: GetAllProductsUsecaseInterface;

    constructor(getAllProductsUsecase: GetAllProductsUsecaseInterface) {
        this.getAllProductsUsecase = getAllProductsUsecase;
    }

    async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        const result = this.getAllProductsUsecase.execute();

        if (result instanceof InfrastructureError) {
            reply.status(500).send({ error: result.message });
            return;
        }
        reply.status(200).send(result);
    }
}