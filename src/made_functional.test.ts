import { randomUUID } from 'crypto';
import {
    addItemToCartUseCase, CartItemRepository, CartRepository, ProductRepository
} from './made_functional';

const cartRepository: CartRepository = {
    load: userId => ({
        id: randomUUID(),
    }),
    isInCart: (cartId, productId) => false,
    getItemCount: cartId => 100,
}

const cartItemRepository: CartItemRepository = {
    insert(cartItem) {
        expect(cartItem.quantity).toBe(8) 
    },
    update(cartItem) {
        fail();
    }
}

const productRepository: ProductRepository = {
    findOnSale(productId) {
        return {
            id: randomUUID()
        }
    }
}
test("add new item", () => {
    addItemToCartUseCase(
        cartRepository,
        cartItemRepository,
        productRepository
    )({
        userId: randomUUID(),
        productId: randomUUID(),
        quantity: 8
    });
});