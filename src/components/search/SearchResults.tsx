import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MediaItem } from '../../types';
import { Book, Tv, Film, Star, Loader } from 'lucide-react';
import { useWishlist } from '../../hooks/useWishlist';
import { useInView } from "react-intersection-observer";

interface SearchResultsProps {
    results: MediaItem[];
    totalResults: number;
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
    results,
    totalResults,
    loading,
    hasMore,
    onLoadMore
}) => {
    const { isInWishlist, toggleWishlist } = useWishlist();
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
        triggerOnce: false
    });

    useEffect(() => {
        if (inView && hasMore && !loading) {
            onLoadMore();
        }
    }, [inView, hasMore, loading]);

    const getMediaIcon = (type: string) => {
        switch (type) {
            case 'movie':
                return <Film className="w-5 h-5" />;
            case 'tv':
                return <Tv className="w-5 h-5" />;
            case 'book':
                return <Book className="w-5 h-5" />;
            default:
                return null;
        }
    };

    const getMediaLink = (item: MediaItem) => {
        switch (item.type) {
            case 'movie':
                return `/movies/${item.id}`;
            case 'tv':
                return `/tv/${item.id}`;
            case 'book':
                return `/books/${item.id}`;
            default:
                return '#';
        }
    };

    if (results.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                    No results found. Try adjusting your search or filters.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Found {totalResults} results
            </div>

            <div className="space-y-4">
                {results.map((item) => (
                    <Link
                        key={`${item.type}-${item.id}`}
                        to={getMediaLink(item)}
                        className="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex items-start p-4">
                            {/* Media Poster/Image */}
                            <div className="flex-shrink-0 w-24 h-36">
                                <img
                                    src={item.poster || '/placeholder-poster.png'}
                                    alt={item.title}
                                    className="w-full h-full object-cover rounded"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 ml-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {getMediaIcon(item.type)}
                                    </span>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                                        {item.type}
                                    </span>
                                </div>

                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                    {item.title}
                                </h3>

                                <div className="flex items-center gap-4 mb-2">
                                    {item.year && (
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.year}
                                        </span>
                                    )}
                                    {item.rating && (
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {item.rating}
                                            </span>
                                        </div>
                                    )}
                                    {item.genre && item.genre.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {item.genre.map((g, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                                                >
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {item.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {item.description}
                                    </p>
                                )}
                            </div>

                            {/* Wishlist Button */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleWishlist(item.id, item.type);
                                }}
                                className={`ml-4 p-2 rounded-full transition-colors duration-200 ${
                                    isInWishlist(item.id)
                                        ? 'text-primary-600 bg-primary-50 dark:bg-primary-900'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                }`}
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill={isInWishlist(item.id) ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Load More */}
            {(hasMore || loading) && (
                <div
                    ref={loadMoreRef}
                    className="flex justify-center items-center py-8"
                >
                    {loading && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Loader className="w-5 h-5 animate-spin" />
                            <span>Loading more results...</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchResults; 