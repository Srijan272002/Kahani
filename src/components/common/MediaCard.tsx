import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Movie } from '../../types';

interface MediaCardProps {
    item: Movie;
    onWishlistToggle?: () => void;
    isInWishlist?: boolean;
}

const MediaCard: React.FC<MediaCardProps> = ({ item, onWishlistToggle, isInWishlist }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <Link to={`/movies/${item.id}`}>
                <div className="aspect-w-2 aspect-h-3 relative">
                    <img
                        src={`https://image.tmdb.org/t/p/w500${item.posterPath}`}
                        alt={item.title}
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <div className="absolute bottom-0 p-4">
                            <h3 className="text-white font-semibold line-clamp-2">
                                {item.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className="text-yellow-400">
                                    ★ {item.voteAverage.toFixed(1)}
                                </span>
                                <span className="text-gray-300">
                                    {new Date(item.releaseDate).getFullYear()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
            {onWishlistToggle && (
                <button
                    onClick={onWishlistToggle}
                    className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-200"
                >
                    <Heart
                        className={`w-5 h-5 ${
                            isInWishlist ? 'fill-red-500 text-red-500' : 'text-white'
                        }`}
                    />
                </button>
            )}
        </div>
    );
};

export default MediaCard; 