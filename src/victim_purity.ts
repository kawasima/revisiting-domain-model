import {
    ProductId,
    Quantity,
    CartItem,
    UserId,
    Page,
    AddItemToCartCommand,
    CartId,
 } from './share'

// 性能を犠牲にせず、かつドメイン層にあるべき責務をドメインレイヤで実装する

/**
 * 更新するときにカートに不変条件のチェックを持たせたい。
 * ↓
 * が、そのためにカートアイテムを全部インスタンス化して持たせることは性能観点からやりたくない
 * ↓
 * ので、更新用と参照用を分けて、更新時の不変条件チェックを全アイテムロードすることなく実施する
 */
class CartForUpdate {
    private static UPPER_BOUND: number = 10000;
    private id: CartId;
    constructor(id: CartId) {
        this.id = id;
    }

    add(productId: ProductId, quantity: Quantity, cartRepository: CartWriteRepository): void { 
        const total = cartRepository.getItemCount();
        if (total + quantity > CartForUpdate.UPPER_BOUND) {
            throw new Error(`商品数の上限に達しています`)
        }
        cartRepository.addItem({
            productId,
            quantity
        });
    }
}

class Cart {
    private id: CartId;
    constructor(id: CartId) {
        this.id = id;
    }
    
    items(page: number, cartRepository: CartReadRepository) {
        return cartRepository.findCartItemsByPage(page);
    }
}

interface CartWriteRepository {
    loadCart(userId: UserId): CartForUpdate;
    saveCart(cart: CartForUpdate): void;
    getItemCount(): number;
    addItem(cart: CartItem): void;
}

interface CartReadRepository {
    findCartItemsByPage(userId: number): Page<CartItem>;
}

interface ProductRepository {
    isNowOnSale(productId: ProductId): boolean;
}

type AddItemToCartUseCase = (command: AddItemToCartCommand) => void;

function addItemToCartUseCase(
    cartRepository: CartWriteRepository,
    productRepository: ProductRepository) {
    return (command: AddItemToCartCommand) => {
        const userId = UserId.parse(command.userId);
        const cart = cartRepository.loadCart(userId);
        const productId = ProductId.parse(command.productId);
        if (!productRepository.isNowOnSale(productId)) {
            throw Error(`販売が終了しました`);
        };
        const quantity = Quantity.parse(command.quantity);
        cart.add(productId, quantity, cartRepository);
    }
}
