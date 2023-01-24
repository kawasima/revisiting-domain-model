import { randomUUID } from 'crypto'
import { addItemToCartUseCase, CartForUpdate, CartWriteRepository, ProductRepository } from './victim_purity'

test('add an item', () => {
    const cartRepository: CartWriteRepository = {
        loadCart: (userId) => new CartForUpdate(randomUUID()),
        saveCart: (cart) => {
            expect(cart)
        },
        getItemCount: () => 0,
        addItem: (cartItem) => {
        },
    }
    const productRepository: ProductRepository = {
        isNowOnSale: productId => true,
    }

    addItemToCartUseCase(
        cartRepository,
        productRepository
    )({
        userId: randomUUID(),
        productId: randomUUID(),
        quantity: 8,
    })
})