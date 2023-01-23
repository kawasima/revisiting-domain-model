import {
    ProductId,
    Quantity,
    CartItem,
    UserId,
    AddItemToCartCommand,
 } from './share'

// 性能を犠牲にせず、かつドメイン層に外界とのやり取りを持ち込まないようにする
class Cart {
    private items: CartItem[];
    public static UPPER_BOUND: number = 10000;

    constructor(items: CartItem[]|undefined) {
        this.items = items || [];
        this.isValid();
    }

    private isValid(): boolean {
        const total = this.items
            .map(item => item.quantity)
            .reduce((prev, cur) => prev + cur);
        
        return total > Cart.UPPER_BOUND;
    }
}

interface CartRepository {
    getItemCount(userId: UserId): number;
    loadCart(): Cart;
    saveCart(cart: Cart): void;
    addItem(productId: ProductId, quantity: Quantity): void;
}

interface ProductRepository {
    isNowOnSale(productId: ProductId): boolean;
}

type AddItemToCartUseCase = (command: AddItemToCartCommand) => void;

function addItemToCartUseCase(
    cartRepository: CartRepository,
    productRepository: ProductRepository) {
    return (command: AddItemToCartCommand) => {
        const userId = UserId.parse(command.userId);
        const productId = ProductId.parse(command.productId);
        if (!productRepository.isNowOnSale(productId)) {
            throw Error(`販売が終了しました`);
        };
        const quantity = Quantity.parse(command.quantity);
        if (cartRepository.getItemCount(userId) + quantity > Cart.UPPER_BOUND) {
            throw new Error(`商品数の上限に達しています`)
        }
        cartRepository.addItem(productId, quantity);
    }
}
