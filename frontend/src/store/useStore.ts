import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: number
  username: string
  email: string
  role: 'admin' | 'user' | 'guest'
}

export interface CartItem {
  id: number
  name: string
  price: number
  original_price?: number
  is_on_sale?: boolean
  quantity: number
}

interface AppState {
  user: User | null
  cart: CartItem[]
  login: (user: User) => void
  logout: () => void
  addToCart: (product: any) => void
  removeFromCart: (productId: number) => void
  updateCartQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      cart: [],
      login: (user) => set({ user }),
      logout: () => set({ user: null, cart: [] }),
      addToCart: (product) =>
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id)
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            }
          }
          return {
            cart: [...state.cart, {
              id: product.id,
              name: product.name,
              price: Number(product.current_price ?? product.price),
              original_price: product.current_price && product.current_price !== product.price ? Number(product.price) : undefined,
              is_on_sale: product.is_on_sale,
              quantity: 1
            }],
          }
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        })),
      updateCartQuantity: (productId, quantity) =>
        set((state) => ({
          cart: state.cart
            .map((item) =>
              item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
            )
            .filter((item) => item.quantity > 0),
        })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'bunshop-storage',
    }
  )
)
