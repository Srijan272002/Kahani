import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Book } from '../types';
import { useWishlist } from '../hooks/useWishlist';
import MediaCard from '../components/common/MediaCard';
import FilterBar, { FilterOptions } from '../components/books/FilterBar';
import { Filter, Loader } from 'lucide-react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

const Books: React.FC = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [genres, setGenres] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        sort: 'popularity',
        genre: '',
        language: '',
        year: '',
        rating: ''
    });

    const loadMoreRef = useInfiniteScroll({
        loading: loadingMore,
        hasMore,
        onLoadMore: () => setPage(prev => prev + 1)
    });

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await api.get('/books/genres');
                setGenres(response.data.data.genres);
            } catch (error) {
                console.error('Failed to fetch genres:', error);
            }
        };

        const fetchLanguages = async () => {
            try {
                const response = await api.get('/books/languages');
                setLanguages(response.data.data.languages);
            } catch (error) {
                console.error('Failed to fetch languages:', error);
            }
        };

        fetchGenres();
        fetchLanguages();
    }, []);

    useEffect(() => {
        setBooks([]);
        setPage(1);
        setHasMore(true);
        setLoading(true);
        fetchBooks(1, true);
    }, [filterOptions]);

    useEffect(() => {
        if (page > 1) {
            fetchBooks(page, false);
        }
    }, [page]);

    const fetchBooks = async (pageNum: number, isNewFilter: boolean) => {
        if (isNewFilter) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const params = new URLSearchParams();
            Object.entries(filterOptions).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
            params.append('page', pageNum.toString());
            params.append('limit', '20');

            const response = await api.get(`/books?${params.toString()}`);
            const { books: newBooks, hasMore: moreAvailable } = response.data.data;

            if (isNewFilter) {
                setBooks(newBooks);
            } else {
                setBooks(prev => [...prev, ...newBooks]);
            }
            setHasMore(moreAvailable);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch books');
        } finally {
            if (isNewFilter) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    };

    const handleFilterChange = useCallback((key: keyof FilterOptions, value: string) => {
        setFilterOptions(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Books</h1>
                <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {books.length} results
                    </span>
                </div>
            </div>

            <FilterBar
                options={filterOptions}
                onFilterChange={handleFilterChange}
                genres={genres}
                languages={languages}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {books.map((book) => (
                    <MediaCard
                        key={book.id}
                        item={book}
                        onWishlistToggle={() => toggleWishlist(book.id)}
                        isInWishlist={isInWishlist(book.id)}
                    />
                ))}
            </div>

            {loadingMore && (
                <div className="flex justify-center items-center py-8">
                    <Loader className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
            )}

            {!loading && !loadingMore && hasMore && (
                <div ref={loadMoreRef} className="h-10" />
            )}

            {!hasMore && books.length > 0 && (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    No more books to load
                </div>
            )}
        </div>
    );
};

export default Books; 