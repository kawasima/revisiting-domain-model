import {
    UserId,
    ProductId,
    Quantity,
    CartItem,
    AddItemToCartCommand,
} from './share'

// 純粋性と完全性を両立させた設計
export class Cart {
    readonly items: CartItem[];
    // ここの数を増やすと危険なので、触らないこと！ (コメント例)
    private static UPPER_BOUND: number = 100;

    constructor(items?: CartItem[]) {
        this.items = items || [];
        this.isValid();
    }

    private isValid(): boolean {
        const total = this.items
            .map(item => item.quantity)
            .reduce((prev, cur) => prev + cur, 0);
        
        return total <= Cart.UPPER_BOUND;
    }

    add(productId: ProductId, quantity: Quantity): void {
        const item = this.items.find(item => item.productId === productId);
        if (item === undefined) {
            this.items.push({ productId, quantity })
        } else {
            item.quantity = item?.quantity + quantity;
        }
        if (!this.isValid()) {
            throw new Error(`商品数の上限に達しています`)
        }
    }
}

export interface CartRepository {
    loadCart(userId: UserId): Cart;
    saveCart(cart: Cart): void;
}

export interface ProductRepository {
    isNowOnSale(productId: ProductId): boolean;
}

type AddItemToCartUseCase = (command: AddItemToCartCommand) => void;

export function addItemToCartUseCase(
    cartRepository: CartRepository,
    productRepository: ProductRepository) {
    return (command: AddItemToCartCommand) => {
        const userId = UserId.parse(command.userId);
        const productId = ProductId.parse(command.productId);
        if (!productRepository.isNowOnSale(productId)) {
            throw Error(`販売が終了しました`);
        };
        const cart = cartRepository.loadCart(userId);
        const quantity = Quantity.parse(command.quantity);
        cart.add(productId, quantity);
        cartRepository.saveCart(cart);
    }
}
