import {
    AddItemToCartCommand,
    Page,
    UserId,
    CartId,
    ProductId,
    Quantity,
} from './share'
import * as E from "fp-ts/Either"
import { pipe } from 'fp-ts/lib/function'
import { z } from "zod"

const Cart = z.object({
    id: CartId
})
type Cart = z.infer<typeof Cart>

type cartItems = (cart: Cart, page: number) => Page<CartItem>

const OnSaleProduct = z.object({
    id: ProductId
})
type OnSaleProduct = z.infer<typeof OnSaleProduct>

const CartItem = z.object({
    cartId: CartId,
    productId: ProductId,
    quantity: Quantity,
})
type CartItem = z.infer<typeof CartItem>

const AddableCartItem = z.object({
    isNew: z.boolean(),
    cartId: CartId,
    product: OnSaleProduct,
    quantity: Quantity,
})
type AddableCartItem = z.infer<typeof AddableCartItem>

type FetchCart = (userId: UserId) => E.Either<Error, Cart>
type ParseCartItem = (command: AddItemToCartCommand, cart: Cart) => E.Either<Error, CartItem>
type ParseAddableCartItem = (cartItem: CartItem) => E.Either<Error, AddableCartItem>
type SaveCartItem = (cartItem: AddableCartItem) => E.Either<Error, void>

export interface CartRepository {
    load: (userId: UserId) => Cart | null;
    getItemCount: (cartId: CartId) => number;
    isInCart: (cartId: CartId, productId: ProductId) => boolean;
}

export interface CartItemRepository {
    insert: (cartItem: CartItem) => void;
    update: (cartItem: CartItem) => void;
}

export interface ProductRepository {
    findOnSale: (productId: ProductId) => OnSaleProduct | null;
}

const parseCartItem: ParseCartItem = (command: AddItemToCartCommand, cart: Cart) => {
    const res = CartItem.safeParse({
        cartId: command.userId,
        productId: command.productId,
        quantity: command.quantity,
    })
    return res.success ? E.right(res.data) : E.left(res.error)
}

function validateCartCapacity(cartRepository: CartRepository) {
    return (cartItem: CartItem): E.Either<Error, CartItem> => {
        if (cartRepository.getItemCount(cartItem.cartId) + cartItem.quantity > 10000) {
            return fail(new Error(`商品数の上限に達しています`))
        }
        return E.right(cartItem)
    }
}

function validateOnSaleProduct(productRepository: ProductRepository) {
    return (cartItem: CartItem): E.Either<Error, OnSaleProduct> => {
        const product = productRepository.findOnSale(cartItem.productId)
        return product != null ? E.right(product) : E.left(new Error(``))
    }
}

function existsInCart(cartRepository: CartRepository) {
    return (cartItem: CartItem): E.Either<Error, boolean> => E.right(cartRepository.isInCart(cartItem.cartId, cartItem.productId))
}

function parseAddableCartItem(
    cartRepository: CartRepository,
    productRepository: ProductRepository,
): ParseAddableCartItem {
    return (cartItem: CartItem): E.Either<Error, AddableCartItem> =>
        pipe(validateCartCapacity(cartRepository)(cartItem),
            E.chain(item => E.sequenceArray([
                validateOnSaleProduct(productRepository)(item) as any, // FIXME
                existsInCart(cartRepository)(item)
            ])),
            E.map(([product, isNew]) =>
                AddableCartItem.parse({
                    isNew,
                    product,
                    cartId: cartItem.cartId,
                    quantity: cartItem.quantity,
                })
            )
        )
}

function saveCartItem(cartItemRepository: CartItemRepository): SaveCartItem {
    return (cartItem: AddableCartItem) => {
        if (cartItem.isNew) {
            cartItemRepository.insert({
                cartId: cartItem.cartId,
                productId: cartItem.product.id,
                quantity: cartItem.quantity
            })
        } else {
            cartItemRepository.insert({
                cartId: cartItem.cartId,
                productId: cartItem.product.id,
                quantity: cartItem.quantity
            })
        }
        return E.right(undefined)
    }
}

function fetchCart(cartRepository: CartRepository): FetchCart {
    return (userId: UserId) => {
        const cart = cartRepository.load(userId)
        return cart != null ? E.right(cart) : E.left(new Error(''))
    }
}

export function addItemToCartUseCase(
    cartRepository: CartRepository,
    cartItemRepository: CartItemRepository,
    productRepository: ProductRepository,
) {
    return (command: AddItemToCartCommand) =>
        pipe(fetchCart(cartRepository)(UserId.parse(command.userId)),
            E.chain(cart => parseCartItem(command, cart)),
            E.chain(parseAddableCartItem(cartRepository, productRepository)),
            E.chain(saveCartItem(cartItemRepository)))
}
