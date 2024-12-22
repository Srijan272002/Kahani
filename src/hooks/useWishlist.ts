import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Movie } from '../types';

export const useWishlist = () => {
    const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await api.get('/users/wishlist');
            const items = response.data.data.wishlist;
            setWishlistItems(new Set(items.map((item: any) => item.itemId)));
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async (movieId: string) => {
        try {
            if (wishlistItems.has(movieId)) {
                await api.delete(`/users/wishlist/${movieId}`);
                setWishlistItems(prev => {
                    const next = new Set(prev);
                    next.delete(movieId);
                    return next;
                });
            } else {
                await api.post('/users/wishlist', {
                    itemId: movieId,
                    itemType: 'MOVIE'
                });
                setWishlistItems(prev => new Set(prev).add(movieId));
            }
        } catch (error) {
            console.error('Failed to update wishlist:', error);
        }
    };

    return {
        wishlistItems,
        loading,
        toggleWishlist,
        isInWishlist: (movieId: string) => wishlistItems.has(movieId)
    };
};