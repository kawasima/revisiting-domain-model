import {
    AddItemToCartCommand,
    Page,
    UserId,
    CartId,
    ProductId,
    Quantity
} from './share';
import { z } from "zod";

const Cart = z.object({
    id: CartId
})
type Cart = z.infer<typeof Cart>

type cartItems = (cart: Cart, page: number) => Page<CartItem>

type OnSaleProduct = {
    id: ProductId
}
const CartItem = z.object({
    cartId: CartId,
    productId: ProductId,
    quantity: Quantity,
});
type CartItem = z.infer<typeof CartItem>

type AddableCartItem = {
    isNew: boolean;
    cartId: CartId;
    product: OnSaleProduct;
    quantity: Quantity;
}

type ParseCartItem = (command: AddItemToCartCommand, cart: Cart) => CartItem
type ParseAddableCartItem = (cartItem: CartItem) => AddableCartItem
type SaveCartItem = (cartItem: AddableCartItem) => void
type FetchCart = (userId: UserId) => Cart

interface CartRepository {
    load: (userId: UserId) => Cart;
    getItemCount: (cartId: CartId) => number;
    isInCart: (cartId: CartId, productId: ProductId) => boolean;
}

interface CartItemRepository {
    insert: (cartItem: CartItem) => void;
    update: (cartItem: CartItem) => void;
}
interface ProductRepository {
    findOnSale: (productId: ProductId) => OnSaleProduct;
}

const parseCartItem: ParseCartItem = (command: AddItemToCartCommand, cart: Cart) => {
    return CartItem.parse({
        cartId: CartId.parse(command.userId),
        productId: ProductId.parse(command.productId),
        quantity: Quantity.parse(command.quantity),
    })
}

// 本当はもっと小さなFunctionに分解すべき
function parseAddableCartItem(
    cartRepository: CartRepository,
    productRepository: ProductRepository,
): ParseAddableCartItem {
    return (cartItem: CartItem) => {
        if (cartRepository.getItemCount(cartItem.cartId) + cartItem.quantity > 10000) {
            throw Error(`商品数の上限に達しています`)
        }
        return {
            isNew: cartRepository.isInCart(cartItem.cartId, cartItem.productId),
            cartId: cartItem.cartId,
            product: productRepository.findOnSale(cartItem.productId),
            quantity: cartItem.quantity,
        }
    }
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
    }
}

function fetchCart(cartRepository: CartRepository): FetchCart {
    return (userId: UserId) => {
        return cartRepository.load(userId)
    }
}

function addItemToCartUseCase(
    cartRepository: CartRepository,
    cartItemRepository: CartItemRepository,
    productRepository: ProductRepository,
) {
    return (command: AddItemToCartCommand) => {
        const cart = fetchCart(cartRepository)(UserId.parse(command.userId));
        const cartItem = parseCartItem(command, cart);
        const addableCartItem = parseAddableCartItem(cartRepository, productRepository)(cartItem);
        saveCartItem(cartItemRepository)(addableCartItem);
    }
}
