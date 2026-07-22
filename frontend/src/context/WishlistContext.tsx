// src/context/WishlistContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { wishlistAPI } from '../Features/wishlist/wishlistAPI';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistCount: number;
  fetchWishlistCount: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistCount, setWishlistCount] = useState(0);
  const { isAuthenticated } = useAuth();

  const fetchWishlistCount = async () => {
    if (!isAuthenticated) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await wishlistAPI.getWishlist();
      if (res.success) {
        setWishlistCount(res.data.length);
      }
    } catch (error) {
      console.error('Error fetching wishlist count:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlistCount();
    } else {
      setWishlistCount(0);
    }
  }, [isAuthenticated]);

  const addToWishlist = async (productId: number) => {
    try {
      await wishlistAPI.add(productId);
      setWishlistCount((prev) => prev + 1);
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      await wishlistAPI.remove(productId);
      setWishlistCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistCount, fetchWishlistCount, addToWishlist, removeFromWishlist }}>
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