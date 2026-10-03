import { createContext, useContext, useState, useEffect} from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  quantity: number;
  stock: number;
  selectedVariant?: string | null;
  selectedColor?: string | null;
  [key: string]: any;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number, variant?: string | null, color?: string | null) => void;
  removeFromCart: (id: string, variant?: string | null, color?: string | null) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean; // <-- ADDED BACK
  totalCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => 
          item.id === newItem.id && 
          item.selectedVariant === newItem.selectedVariant && 
          item.selectedColor === newItem.selectedColor
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, newItem];
    });
  };

  const updateQuantity = (id: string, quantity: number, variant?: string | null, color?: string | null) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id && item.selectedVariant === variant && item.selectedColor === color) {
          return { ...item, quantity: Math.max(0, quantity) };
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string, variant?: string | null, color?: string | null) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === id && item.selectedVariant === variant && item.selectedColor === color))
    );
  };

  const clearCart = () => setCart([]);

  // <-- ADDED BACK: Checks if ANY variant of this product is in the cart
  const isInCart = (id: string) => {
    return cart.some((item) => item.id === id);
  };

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, isInCart, totalCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
};