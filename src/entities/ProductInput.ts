import { ProductOrder } from "./ProductOrder";

export class ProductInput {

  private constructor(
    private id: string,
    private productOrder: ProductOrder,
    private inputQuantity: number,
    private inputDate: Date,
  ) {}

  public static create(
    productOrder: ProductOrder,
    inputQuantity: number,
    inputDate: Date,
  ): ProductInput | Error {
    if (!productOrder) {
      return new Error("Product order is required");
    }

    if (!Number.isInteger(inputQuantity) || inputQuantity <= 0) {
      return new Error("Input quantity must be a positive integer");
    }

    if (!inputDate || isNaN(inputDate.getTime())) {
      return new Error("Invalid input date");
    }

    return new ProductInput(
      crypto.randomUUID(),
      productOrder,
      inputQuantity,
      inputDate,
    );
  }

  public getId(): string {
    return this.id;
  }

  public getProductOrder(): ProductOrder {
    return this.productOrder;
  }

  public getProductOrderId(): string {
    return this.productOrder.getId();
  }

  public getInputQuantity(): number {
    return this.inputQuantity;
  }

  public getInputDate(): Date {
    return this.inputDate;
  }

  public formatInputDate(): string {
    return this.inputDate.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "Z");
  }
}
