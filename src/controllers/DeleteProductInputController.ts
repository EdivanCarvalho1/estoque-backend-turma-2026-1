import type { FastifyReply, FastifyRequest } from "fastify";
import { InfrastructureError } from "../InfrastructureError";
import type { DeleteProductInputUsecaseInterface } from "../usecases/DeleteProductInputUsecase";

export class DeleteProductInputController {
    constructor(private readonly deleteProductInputUsecase: DeleteProductInputUsecaseInterface) {}

    public async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
        const { productInputId } = request.params as { productInputId?: string };
        const result = this.deleteProductInputUsecase.execute(productInputId ?? "");

        if (result instanceof InfrastructureError) {
            return response.status(500).send({ error: result.message });
        }

        if (result instanceof Error) {
            const status = result.message === "Product input not found" ? 404 : 400;
            return response.status(status).send({ error: result.message });
        }

        return response.status(200).send({ message: "Product input deleted successfully" });
    }
}
