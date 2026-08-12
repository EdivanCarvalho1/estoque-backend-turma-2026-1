import type { FastifyRequest, FastifyReply } from "fastify";
import Database from "better-sqlite3";


export class DeleteProductInputController {
    public async handle(request: FastifyRequest, response: FastifyReply): Promise<void> {
        const { productInputId } = request.params as { productInputId: string; };

        if (!productInputId) {
            return response.status(400).send({ error: "Product input ID is required" });
        }

        try {
            const connection = new Database("db/estoque.sqlite");

            const getProductInputStatement = connection.prepare("SELECT * FROM product_inputs WHERE id = ?");
            const productInput = getProductInputStatement.get(productInputId) as { id: string; product_order_id: string; input_quantity: number; input_date: string } | undefined;
            if (!productInput) {
                return response.status(404).send({ error: "Product input not found" });
            }

            const getProductOrderStatement = connection.prepare("SELECT * FROM product_orders WHERE id = ?");
            const productOrder = getProductOrderStatement.get(productInput.product_order_id) as { id: string; product_barcode: string; order_quantity: number; order_date: string, status: string } | undefined;
            if (!productOrder) {
                return response.status(404).send({ error: "Product order not found" });
            }

            const getProductStatement = connection.prepare("SELECT * FROM products WHERE barcode = ?");
            const product = getProductStatement.get(productOrder.product_barcode) as { barcode: string; name: string; quantity_in_stock: number } | undefined;
            if (!product) {
                return response.status(404).send({ error: "Product not found" });
            }

            if (product.quantity_in_stock < productInput.input_quantity) {
                return response.status(400).send({ error: "Cannot delete product input as it would result in negative stock" });
            }

            const deleteStatement = connection.prepare("DELETE FROM product_inputs WHERE id = ?");
            deleteStatement.run(productInputId);

            const newStock = product.quantity_in_stock - productInput.input_quantity;

            const updateProductStatement = connection.prepare("UPDATE products SET quantity_in_stock = ? WHERE barcode = ?");
            updateProductStatement.run(newStock, product.barcode);

            const updateProductOrderStatement = connection.prepare("UPDATE product_orders SET status = ? WHERE id = ?");
            updateProductOrderStatement.run("opened", productOrder.id);

            return response.status(200).send({
                message: "Product input deleted successfully"
             });


        } catch (Newerror) {
            return response.status(500).send({ error: Newerror });
        }
    }
}