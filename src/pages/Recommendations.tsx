import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { MediaItem } from '../types';
import { Book, Tv, Film, History, ThumbsUp, ThumbsDown, Loader } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';

interface RecommendationGroup {
    theme: string;
    items: MediaItem[];
}

interface RecommendationSet {
    movies: MediaItem[];
    tvShows: MediaItem[];
    books: MediaItem[];
    crossMedia: RecommendationGroup[];
}

interface HistoryEntry {
    id: string;
    recommendations: RecommendationSet;
    generatedAt: string;
}

const Recommendations: React.FC = () => {
    const [recommendations, setRecommendations] = useState<RecommendationSet | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const { isInWishlist, toggleWishlist } = useWishlist();

    useEffect(() => {
        fetchRecommendations();
        fetchHistory();
    }, []);

    const fetchRecommendations = async () => {
        try {
            const response = await api.get('/recommendations');
            setRecommendations(response.data.data);
        } catch (error) {
            setError('Failed to load recommendations');
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await api.get('/recommendations/history');
            setHistory(response.data.data);
        } catch (error) {
            console.error('Error fetching recommendation history:', error);
        }
    };

    const handleFeedback = async (recommendationId: string, isPositive: boolean) => {
        try {
            await api.post('/recommendations/feedback', {
                recommendationId,
                feedback: isPositive ? 'positive' : 'negative'
            });
            // Optionally refresh recommendations
            fetchRecommendations();
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={fetchRecommendations}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Your Recommendations</h1>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    <History className="w-4 h-4" />
                    {showHistory ? 'Current Recommendations' : 'View History'}
                </button>
            </div>

            {showHistory ? (
                <div className="space-y-8">
                    {history.map((entry) => (
                        <div
                            key={entry.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">
                                    Recommendations from {new Date(entry.generatedAt).toLocaleDateString()}
                                </h2>
                            </div>
                            {/* Render historical recommendations */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {entry.recommendations.crossMedia.map((group, index) => (
                                    <div key={index} className="space-y-4">
                                        <h3 className="font-medium">{group.theme}</h3>
                                        {group.items.map((item) => (
                                            <Link
                                                key={item.id}
                                                to={getMediaLink(item)}
                                                className="flex items-start p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                                            >
                                                <img
                                                    src={item.poster || '/placeholder-poster.png'}
                                                    alt={item.title}
                                                    className="w-16 h-24 object-cover rounded"
                                                />
                                                <div className="ml-3">
                                                    <div className="flex items-center gap-2">
                                                        {getMediaIcon(item.type)}
                                                        <span className="text-sm text-gray-500">
                                                            {item.type}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-medium">{item.title}</h4>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-12">
                    {/* Cross-Media Recommendations */}
                    <section>
                        <h2 className="text-xl font-semibold mb-6">Because You Like...</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {recommendations?.crossMedia.map((group, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                                >
                                    <h3 className="font-medium mb-4">{group.theme}</h3>
                                    <div className="space-y-4">
                                        {group.items.map((item) => (
                                            <Link
                                                key={item.id}
                                                to={getMediaLink(item)}
                                                className="flex items-start hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2"
                                            >
                                                <img
                                                    src={item.poster || '/placeholder-poster.png'}
                                                    alt={item.title}
                                                    className="w-16 h-24 object-cover rounded"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {getMediaIcon(item.type)}
                                                        <span className="text-sm text-gray-500">
                                                            {item.type}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-medium mb-1">{item.title}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleFeedback(item.id, true);
                                                            }}
                                                            className="p-1 hover:text-green-500"
                                                        >
                                                            <ThumbsUp className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleFeedback(item.id, false);
                                                            }}
                                                            className="p-1 hover:text-red-500"
                                                        >
                                                            <ThumbsDown className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                toggleWishlist(item.id, item.type);
                                                            }}
                                                            className={`ml-auto p-1 ${
                                                                isInWishlist(item.id)
                                                                    ? 'text-primary-600'
                                                                    : 'text-gray-400 hover:text-gray-600'
                                                            }`}
                                                        >
                                                            <svg
                                                                className="w-4 h-4"
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
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Media-Specific Recommendations */}
                    {['movies', 'tvShows', 'books'].map((mediaType) => (
                        <section key={mediaType}>
                            <h2 className="text-xl font-semibold mb-6">
                                Recommended {mediaType === 'tvShows' ? 'TV Shows' : mediaType}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {recommendations?.[mediaType as keyof RecommendationSet]?.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={getMediaLink(item)}
                                        className="group"
                                    >
                                        <div className="relative aspect-[2/3] mb-2">
                                            <img
                                                src={item.poster || '/placeholder-poster.png'}
                                                alt={item.title}
                                                className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-200"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    toggleWishlist(item.id, item.type);
                                                }}
                                                className={`absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 ${
                                                    isInWishlist(item.id)
                                                        ? 'text-primary-600'
                                                        : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                            >
                                                <svg
                                                    className="w-4 h-4"
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
                                        <h3 className="font-medium text-sm mb-1 line-clamp-2">
                                            {item.title}
                                        </h3>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Recommendations; 