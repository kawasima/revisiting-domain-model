import {
    AddItemToCartCommand,
    CartId,
    Page,
    ProductId,
    Quantity,
    UserId,
} from './share';

type Cart = {
    id: CartId;
}

type cartItems = (cart: Cart, page: number) => Page<CartItem>

type OnSaleProduct = {
    id: ProductId
}
type CartItem = {
    cartId: CartId;
    productId: ProductId;
    quantity: Quantity;
}
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
    // ほんとは各々バリデーションしながら型変換する。ここでは省略。
    return {
        cartId: new CartId(command.userId),
        productId: new ProductId(command.productId),
        quantity: new Quantity(command.quantity),
    }
}

// 本当はもっと小さなFunctionに分解すべき
function parseAddableCartItem(
    cartRepository: CartRepository,
    productRepository: ProductRepository,
): ParseAddableCartItem {
    return (cartItem: CartItem) => {
        if (cartRepository.getItemCount(cartItem.cartId) + cartItem.quantity.asNumber() > 10000) {
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
        const cart = fetchCart(cartRepository)(new UserId(command.userId));
        const cartItem = parseCartItem(command, cart);
        const addableCartItem = parseAddableCartItem(cartRepository, productRepository)(cartItem);
        saveCartItem(cartItemRepository)(addableCartItem);
    }
}
