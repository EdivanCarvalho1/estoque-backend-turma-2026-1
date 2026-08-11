import fastify from "fastify";
import { SqliteConnection } from "./repositories/SqliteConnection";
import { ProductRepository } from "./repositories/ProductRepository";
import { ProductOrderRepository } from "./repositories/ProductOrderRepository";
import { ProductInputRepository } from "./repositories/ProductInputRepository";

import { CreateProductUsecase } from "./usecases/CreateProductUsecase";
import { CreateProductOrderUsecase } from "./usecases/CreateProductOrderUsecase";
import { CreateProductInputUsecase } from "./usecases/CreateProductInputUsecase";

import { CreateProductController } from "./controllers/CreateProductController";
import { CreateProductOrderController } from "./controllers/CreateProductOrderController";
import { CreateProductInputController } from "./controllers/CreateProductInputController";

// Instanciação da infraestrutura de banco de dados
const sqliteConnection = new SqliteConnection("db/estoque.sqlite");

// Instanciação de Repositórios aplicando inversão de dependência
const productRepository = new ProductRepository(sqliteConnection);
const productOrderRepository = new ProductOrderRepository(sqliteConnection);
const productInputRepository = new ProductInputRepository(sqliteConnection);

// Instanciação de Casos de Uso
const createProductUsecase = new CreateProductUsecase(productRepository);
const createProductOrderUsecase = new CreateProductOrderUsecase(productRepository, productOrderRepository);
const createProductInputUsecase = new CreateProductInputUsecase(
    productOrderRepository,
    productInputRepository,
    productRepository,
);

// Instanciação de Adaptadores de Interface (Controllers)
const createProductController = new CreateProductController(createProductUsecase);
const createProductOrderController = new CreateProductOrderController(createProductOrderUsecase);
const createProductInputController = new CreateProductInputController(createProductInputUsecase);

const app = fastify();

// Declaração de Rotas da API
app.post("/products", async (request, reply) => { 
    await createProductController.handle(request, reply); 
});

app.post("/product-orders", async (request, reply) => { 
    await createProductOrderController.handle(request, reply); 
});

app.post("/product-inputs", async (request, reply) => { 
    await createProductInputController.handle(request, reply); 
});

app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
    console.log(`Server is running at ${address}`);
});
