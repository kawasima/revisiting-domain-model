import { randomUUID } from 'crypto'
import { addItemToCartUseCase, Cart, CartRepository, ProductRepository } from './victim_performance'

test('add a new item', () => {
    const cartRepository: CartRepository = {
        loadCart: (userId) => new Cart(),
        saveCart: (cart) => {
            expect(cart.items.length).toBe(1)
        },
    }
    
    const productRepository: ProductRepository = {
        isNowOnSale: (productId) => true,
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

test('Cart full', () => {
    const cartRepository: CartRepository = {
        loadCart: (userId) => new Cart(),
        saveCart: (cart) => {
            expect(cart.items.length).toBe(1)
        },
    }
    
    const productRepository: ProductRepository = {
        isNowOnSale: (productId) => true,
    }

    expect(() => addItemToCartUseCase(
            cartRepository,
            productRepository
        )({
            userId: randomUUID(),
            productId: randomUUID(),
            quantity: 101,
        })
    ).toThrow(/上限/)
})