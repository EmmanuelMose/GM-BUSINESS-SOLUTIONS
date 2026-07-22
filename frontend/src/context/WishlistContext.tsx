import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { wishlistAPI } from '../Features/wishlist/wishlistAPI';

interface WishlistContextType {
  count: number;
  refreshCount: () => Promise<void>;
  increment: () => void;
  decrement: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const refreshCount = async () => {
    try {
      const res = await wishlistAPI.getWishlist();
      if (res.success) {
        setCount(res.data.length);
      }
    } catch (error) {
      // if unauthorized, set to 0
      setCount(0);
    }
  };

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => Math.max(0, prev - 1));

  useEffect(() => {
    refreshCount();
  }, []);

  return (
    <WishlistContext.Provider value={{ count, refreshCount, increment, decrement }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}