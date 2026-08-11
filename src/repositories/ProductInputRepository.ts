import Database from "better-sqlite3";
import type { ProductInput } from "../entities/ProductInput";
import { InfrastructureError } from "../InfrastructureError";
import type { SqliteConnection } from "./SqliteConnection";

export interface ProductInputRepositoryInterface {
  create(productInput: ProductInput): void | InfrastructureError;
}

export class ProductInputRepository implements ProductInputRepositoryInterface {
  private static readonly INSERT_PRODUCT_INPUT =
    "INSERT INTO product_inputs (id, product_order_id, input_quantity, input_date) VALUES (?, ?, ?, ?)";

  private readonly sqliteConnection: SqliteConnection;

  constructor(connection: SqliteConnection) {
    this.sqliteConnection = connection;
  }

  public create(productInput: ProductInput): void | InfrastructureError {
    try {
      const connection: Database.Database = this.sqliteConnection.getConnection();
      const insertStatement = connection.prepare(
        ProductInputRepository.INSERT_PRODUCT_INPUT,
      );
      insertStatement.run(
        productInput.getId(),
        productInput.getProductOrderId(),
        productInput.getInputQuantity(),
        productInput.formatInputDate(),
      );
    } catch (error) {
      return new InfrastructureError("Failed to create product input");
    }
  }
}
