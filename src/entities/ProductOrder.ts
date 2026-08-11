import { Product } from "./Product";

export class ProductOrder{
    private id: string;
    private product: Product;
    private orderQuantity: number;
    private orderDate: Date;
    private status: string;

    private constructor(id: string, product: Product, orderQuantity: number, orderDate: Date, status: string){
        this.id = id;
        this.product = product;
        this.orderQuantity = orderQuantity;
        this.orderDate = orderDate;
        this.status = status;
    }

    public static create(product: Product, orderQuantity: number, orderDate: Date): ProductOrder | Error{
        if(orderQuantity <= 0){
            return new Error("A quantidade do pedido deve ser maior que zero.");
        }

        if(this.isInteger(orderQuantity) === false){
            return new Error("A quantidade do pedido deve ser um número inteiro.");
        }

        if(orderDate > new Date()){
            return new Error("A data do pedido não pode ser no futuro.");
        }

        if(!product){
            return new Error("O produto do pedido é obrigatório.");
        }

        return new ProductOrder(
            crypto.randomUUID(),
            product,
            orderQuantity,
            orderDate,
            "opened"
        );
    }

    public static rebuild(
        id: string,
        product: Product,
        orderQuantity: number,
        orderDate: Date,
        status: string,
    ): ProductOrder {
        return new ProductOrder(id, product, orderQuantity, orderDate, status);
    }

    private static isInteger(value: number): boolean {
        return Number.isInteger(value);
    }
    
    public getId(): string{
        return this.id;
    }

    public getProduct(): Product{
        return this.product;
    }

    public getOrderQuantity(): number{
        return this.orderQuantity;
    }

    public getOrderDate(): Date {
        return this.orderDate;
    }

    public getStatus(): string {
        return this.status;
    }

    public formatOrderDate(): string{
        return this.orderDate.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, 'Z');
    }
}
