import { randomUUID } from 'crypto';
import { isGeneratorFunction } from 'util/types';
import {
    UserId,
    ProductId,
    CartItemId,
    CartId,
    Quantity,
    AddItemToCartCommand,
} from './share'

// 集約を分ける。
// 実際には、カートとカートアイテムは、カートアイテムが強くカートに依存するので、
// これは良い分割とはならないだろう。

type CartItem = {
    id: CartItemId;
    cartId: CartId; 
    productId: ProductId;
    quantity: Quantity;
}

class Cart {
    private itemIds: CartItemId[];
    readonly id: CartId;
    public static UPPER_BOUND: number = 10000;

    constructor(id: CartId, itemIds: CartItemId[]|undefined) {
        this.id = id;
        this.itemIds = itemIds || [];
    }
}

interface CartRepository {
    loadCart(userId: UserId): Cart;
    saveCart(cart: Cart): void;
    getItemCount(cartId: CartId): number;
}

interface CartItemRepository {
    insert(cartItem: CartItem): void;
}

interface ProductRepository {
    isNowOnSale(productId: ProductId): boolean;
}

type AddItemToCartUseCase = (command: AddItemToCartCommand) => void;

function validateCartInvariant(
    cartRepository: CartRepository,
) {
    return (cartId: CartId, quantity: Quantity) => {
        if (cartRepository.getItemCount(cartId) + quantity > Cart.UPPER_BOUND) {
            throw new Error(`商品数が上限に達しています`)
        }
    }
}

function addItemToCartUseCase(
    cartRepository: CartRepository,
    cartItemRepository: CartItemRepository,
    productRepository: ProductRepository,
) {
    return (command: AddItemToCartCommand) => {
        const userId = UserId.parse(command.userId);
        const productId = ProductId.parse(command.productId);
        if (!productRepository.isNowOnSale(productId)) {
            throw Error(`販売が終了しました`);
        }
        const cart = cartRepository.loadCart(userId);
        const quantity = Quantity.parse(command.quantity);
        // カートアイテムの数量チェック
        validateCartInvariant(cartRepository)(cart.id, quantity);
        cartItemRepository.insert({
            id: randomUUID(),
            cartId: cart.id,
            productId, quantity
        });
    }
}