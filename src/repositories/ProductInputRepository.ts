import Database from "better-sqlite3";
import { ProductInput } from "../entities/ProductInput";
import { Product } from "../entities/Product";
import { ProductOrder } from "../entities/ProductOrder";
import { InfrastructureError } from "../InfrastructureError";
import type { SqliteConnection } from "./SqliteConnection";

export interface ProductInputRepositoryInterface {
  create(productInput: ProductInput): void | InfrastructureError;
}

export interface ProductInputDeletionRepositoryInterface {
  findById(id: string): ProductInput | null | InfrastructureError;
  delete(id: string): void | InfrastructureError;
}

export interface ProductInputLeadTimeRepositoryInterface {
  findAllByProductBarcode(barcode: string): ProductInput[] | InfrastructureError;
}

export class ProductInputRepository implements ProductInputRepositoryInterface, ProductInputDeletionRepositoryInterface, ProductInputLeadTimeRepositoryInterface {
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

  public findById(id: string): ProductInput | null | InfrastructureError {
    try {
      const row = this.sqliteConnection.getConnection().prepare(
        `${ProductInputRepository.SELECT_WITH_RELATIONS} WHERE pi.id = ?`,
      ).get(id) as ProductInputRow | undefined;
      return row ? this.toEntity(row) : null;
    } catch {
      return new InfrastructureError("Failed to find product input");
    }
  }

  public findAllByProductBarcode(barcode: string): ProductInput[] | InfrastructureError {
    try {
      const rows = this.sqliteConnection.getConnection().prepare(
        `${ProductInputRepository.SELECT_WITH_RELATIONS} WHERE p.barcode = ?`,
      ).all(barcode) as ProductInputRow[];
      return rows.map((row) => this.toEntity(row));
    } catch {
      return new InfrastructureError("Failed to find product inputs");
    }
  }

  public delete(id: string): void | InfrastructureError {
    try {
      this.sqliteConnection.getConnection().prepare("DELETE FROM product_inputs WHERE id = ?").run(id);
    } catch {
      return new InfrastructureError("Failed to delete product input");
    }
  }

  private static readonly SELECT_WITH_RELATIONS = `
    SELECT pi.id, pi.input_quantity, pi.input_date,
           po.id AS product_order_id, po.order_quantity, po.order_date, po.status,
           p.barcode, p.name, p.quantity_in_stock
      FROM product_inputs pi
      JOIN product_orders po ON po.id = pi.product_order_id
      JOIN products p ON p.barcode = po.product_barcode`;

  private toEntity(row: ProductInputRow): ProductInput {
    const product = Product.rebuild(row.barcode, row.name, row.quantity_in_stock);
    const order = ProductOrder.rebuild(row.product_order_id, product, row.order_quantity, new Date(row.order_date), row.status);
    return ProductInput.rebuild(row.id, order, row.input_quantity, new Date(row.input_date));
  }
}

interface ProductInputRow {
  id: string;
  input_quantity: number;
  input_date: string;
  product_order_id: string;
  order_quantity: number;
  order_date: string;
  status: string;
  barcode: string;
  name: string;
  quantity_in_stock: number;
}
