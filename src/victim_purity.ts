import {
    ProductId,
    Quantity,
    CartItem,
    UserId,
    Page,
    AddItemToCartCommand,
 } from './share'

// 性能を犠牲にせず、かつドメイン層にあるべき責務をドメインレイヤで実装する
class CartForUpdate {
    private static UPPER_BOUND: number = 10000;
    private owner: UserId;
    constructor(owner: UserId) {
        this.owner = owner;
    }

    public isValid(cartRepository: CartWriteRepository): boolean {
        const total = cartRepository.getItemCount();
        
    }

    add(productId: ProductId, quantity: Quantity, cartRepository: CartWriteRepository): void { 
        const total = cartRepository.getItemCount();
        if (total + quantity.asNumber() > CartForUpdate.UPPER_BOUND) {
            throw new Error(`商品数の上限に達しています`)
        }
    }
}

class Cart {
    items(page: number, cartRepository: CartReadRepository) {
        return cartRepository.findCartItemsByPage();
    }
}

interface CartWriteRepository {
    loadCart(userId: UserId): CartForUpdate;
    saveCart(cart: CartForUpdate): void;
    getItemCount(): number;
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
        const userId = new UserId(command.userId);
        const cart = cartRepository.loadCart(userId);
        const productId = new ProductId(command.productId);
        if (!productRepository.isNowOnSale(productId)) {
            throw Error(`販売が終了しました`);
        };
        const quantity = new Quantity(command.quantity);
        cart.add(productId, quantity, cartRepository);
    }
}
