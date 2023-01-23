import { randomUUID } from "crypto";

export class ProductId {
    private value: string;
    constructor(value: string) {
        this.value = value;
    }
}

export class CartId {
    private value: string;
    constructor(value?: string) {
        this.value = value || randomUUID();
    }
}

export class CartItemId {
    private value: string;
    constructor(value?: string) {
        this.value = value || randomUUID();
    }
}


export class Quantity {
    private value: number;
    constructor(value: number) {
        this.value = value;
    }
    add(acc: Quantity): Quantity {
        return new Quantity(acc.value + this.value)
    }
    asNumber(): number {
        return this.value;
    }
}

export class UserId {
    private value: string;
    constructor(value: string) {
        this.value = value;
    }
}

export type Page<T> = {
    total: number;
    page: number;
    sze: number;
    items: T;
}
export type CartItem = {
    productId: ProductId;
    quantity: Quantity;
}

export type AddItemToCartCommand = {
    productId: string;
    quantity: number;
    userId: string;
}
