import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product, DeliveryMode, Language } from '@/types';

interface CartState {
  items: CartItem[];
  deliveryMode: DeliveryMode;
  language: Language;
  isCartOpen: boolean;

  // Cart actions
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // UI actions
  setDeliveryMode: (mode: DeliveryMode) => void;
  toggleLanguage: () => void;
  setCartOpen: (open: boolean) => void;

  // Computed helpers (as getters via selectors)
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDeliveryCharge: () => number;
  getTotal: () => number;
}

const DELIVERY_CHARGE = Number(import.meta.env.VITE_DELIVERY_CHARGE ?? 40);

export const useStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryMode: 'delivery',
      language: 'en',
      isCartOpen: false,

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...product, quantity: 1 }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      setDeliveryMode: (mode) => set({ deliveryMode: mode }),

      toggleLanguage: () =>
        set((state) => ({
          language: state.language === 'en' ? 'hi' : 'en',
        })),

      setCartOpen: (open) => set({ isCartOpen: open }),

      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getDeliveryCharge: () =>
        get().deliveryMode === 'pickup' ? 0 : DELIVERY_CHARGE,

      getTotal: () => get().getSubtotal() + get().getDeliveryCharge(),
    }),
    {
      name: 'krishna-store-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        deliveryMode: state.deliveryMode,
        language: state.language,
      }),
    }
  )
);

// Convenience selector hooks
export const useCart = () => useStore((s) => s.items);
export const useLanguage = () => useStore((s) => s.language);
export const useTotalItems = () => useStore((s) => s.getTotalItems());
