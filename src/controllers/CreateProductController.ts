import { InfrastructureError } from "../InfrastructureError";
import type { CreateProductUsecaseInterface } from "../usecases/CreateProductUsecase";
import type { FastifyReply, FastifyRequest } from "fastify";

export class CreateProductController {

    private createProductUseCase: CreateProductUsecaseInterface;

    constructor(createProductUseCase: CreateProductUsecaseInterface) {
        this.createProductUseCase = createProductUseCase;
    }

    async handle(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        if(typeof request.body !== "object") {
            reply.status(400).send({ error: "Invalid request body" });
            return;
        }
        const { barcode, name } = request.body as { barcode: string, name: string };

        const result = this.createProductUseCase.execute(barcode, name);

        if (result instanceof InfrastructureError) {
            reply.status(500).send({ error: result.message });
            return;
        }
        
        if (result instanceof Error) {
            reply.status(400).send({ error: result.message });
            return;
        }

        reply.status(201).send({ 
            barcode: result.barcode, 
            name: result.name, 
            quantityInStock: result.quantityInStock 
        });
    }

}
