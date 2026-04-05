import { useState, useEffect } from 'react';

export interface WishlistItem {
  id: string;
  institute: string;
  program: string;
  quota: string;
  seatType: string;
  gender: string;
  closingRank: number | null;
  openingRank: number | null;
  source: string;
  year: string | number;
  round: string | number;
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('motivation_wishlist');
    if (stored) {
      try {
        setWishlist(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    }
  }, []);

  const saveWishlist = (newList: WishlistItem[]) => {
    setWishlist(newList);
    localStorage.setItem('motivation_wishlist', JSON.stringify(newList));
  };

  const addToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      if (prev.some((w) => w.id === item.id)) return prev;
      const newList = [...prev, item];
      localStorage.setItem('motivation_wishlist', JSON.stringify(newList));
      return newList;
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => {
      const newList = prev.filter((w) => w.id !== id);
      localStorage.setItem('motivation_wishlist', JSON.stringify(newList));
      return newList;
    });
  };

  const isInWishlist = (id: string) => {
    return wishlist.some((w) => w.id === id);
  };

  const toggleWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  return {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    mounted
  };
}
