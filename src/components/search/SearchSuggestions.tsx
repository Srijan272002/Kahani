import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Tv, Film } from 'lucide-react';

interface Suggestion {
    id: string;
    title: string;
    type: 'movie' | 'tv' | 'book';
    year: string;
    poster: string | null;
}

interface SearchSuggestionsProps {
    suggestions: Suggestion[];
    onSelect: (suggestion: Suggestion) => void;
    isVisible: boolean;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
    suggestions,
    onSelect,
    isVisible
}) => {
    if (!isVisible || suggestions.length === 0) {
        return null;
    }

    const getMediaIcon = (type: string) => {
        switch (type) {
            case 'movie':
                return <Film className="w-4 h-4" />;
            case 'tv':
                return <Tv className="w-4 h-4" />;
            case 'book':
                return <Book className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const getMediaLink = (suggestion: Suggestion) => {
        switch (suggestion.type) {
            case 'movie':
                return `/movies/${suggestion.id}`;
            case 'tv':
                return `/tv/${suggestion.id}`;
            case 'book':
                return `/books/${suggestion.id}`;
            default:
                return '#';
        }
    };

    return (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
            {suggestions.map((suggestion) => (
                <Link
                    key={`${suggestion.type}-${suggestion.id}`}
                    to={getMediaLink(suggestion)}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    onClick={() => onSelect(suggestion)}
                >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-10 h-14 mr-3">
                        {suggestion.poster ? (
                            <img
                                src={suggestion.poster}
                                alt={suggestion.title}
                                className="w-full h-full object-cover rounded"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                {getMediaIcon(suggestion.type)}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-500 dark:text-gray-400">
                                {getMediaIcon(suggestion.type)}
                            </span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 capitalize">
                                {suggestion.type}
                            </span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {suggestion.title}
                        </h4>
                        {suggestion.year && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {suggestion.year}
                            </p>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default SearchSuggestions; 