import { randomUUID } from 'crypto'
import { addItemToCartUseCase, Cart, CartRepository, ProductRepository } from './victim_completeness'

test('add an item successfully', () => {
    const cartRepository: CartRepository = {
        loadCart: userId => new Cart(randomUUID()),
        saveCart: cart => {},
        getItemCount: cartId => 0,
        addItem: (productId, quantity) => {
            expect(quantity).toBe(8)
        }
    }
    const productRepository: ProductRepository = {
        isNowOnSale: productId => true,
    }

    addItemToCartUseCase(
        cartRepository,
        productRepository,
    )({
        userId: randomUUID(),
        productId: randomUUID(),
        quantity: 8,
    })
})

test('cart full', () => {
    const cartRepository: CartRepository = {
        loadCart: userId => new Cart(randomUUID()),
        saveCart: cart => {},
        getItemCount: cartId => 10000,
        addItem: (productId, quantity) => {
            fail()
        }
    }
    const productRepository: ProductRepository = {
        isNowOnSale: productId => true,
    }
    expect(() => addItemToCartUseCase(
            cartRepository,
            productRepository
        )({
            userId: randomUUID(),
            productId: randomUUID(),
            quantity: 1,
        })
    ).toThrow(/上限/)

})