import { z } from "zod";

export const CartId = z.string().uuid();
export type CartId = z.infer<typeof CartId>;

export const ProductId = z.string().uuid();
export type ProductId = z.infer<typeof ProductId>;

export const CartItemId = z.string().uuid();
export type CartItemId = z.infer<typeof CartItemId>;

export const UserId = z.string().uuid();
export type UserId = z.infer<typeof UserId>;

export const Quantity = z.number().positive();
export type Quantity = z.infer<typeof Quantity>;

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
