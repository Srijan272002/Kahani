import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface AdvancedFilters {
    genre?: string[];
    year?: string;
    rating?: string;
    language?: string;
    runtime?: string;
}

interface SearchFiltersProps {
    selectedTypes: string[];
    sortBy: string;
    advancedFilters: AdvancedFilters;
    onTypeChange: (types: string[]) => void;
    onSortChange: (sort: string) => void;
    onAdvancedFilterChange: (filters: AdvancedFilters) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
    selectedTypes,
    sortBy,
    advancedFilters,
    onTypeChange,
    onSortChange,
    onAdvancedFilterChange
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const mediaTypes = [
        { id: 'movie', label: 'Movies' },
        { id: 'tv', label: 'TV Shows' },
        { id: 'book', label: 'Books' }
    ];

    const sortOptions = [
        { value: 'relevance', label: 'Most Relevant' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'latest', label: 'Latest' },
        { value: 'popularity', label: 'Most Popular' }
    ];

    const genres = [
        'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
        'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
        'Horror', 'Music', 'Mystery', 'Romance', 'Science Fiction',
        'Thriller', 'War', 'Western'
    ];

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Spanish' },
        { code: 'fr', label: 'French' },
        { code: 'de', label: 'German' },
        { code: 'it', label: 'Italian' },
        { code: 'ja', label: 'Japanese' },
        { code: 'ko', label: 'Korean' },
        { code: 'zh', label: 'Chinese' }
    ];

    const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString());

    const ratings = [
        { value: '9', label: '9+ Rating' },
        { value: '8', label: '8+ Rating' },
        { value: '7', label: '7+ Rating' },
        { value: '6', label: '6+ Rating' }
    ];

    const runtimes = [
        { value: '60', label: 'Under 1 hour' },
        { value: '90', label: 'Under 1.5 hours' },
        { value: '120', label: 'Under 2 hours' },
        { value: '180', label: 'Under 3 hours' }
    ];

    const handleTypeToggle = (typeId: string) => {
        if (selectedTypes.includes(typeId)) {
            onTypeChange(selectedTypes.filter(id => id !== typeId));
        } else {
            onTypeChange([...selectedTypes, typeId]);
        }
    };

    const handleGenreToggle = (genre: string) => {
        const currentGenres = advancedFilters.genre || [];
        const updatedGenres = currentGenres.includes(genre)
            ? currentGenres.filter(g => g !== genre)
            : [...currentGenres, genre];

        onAdvancedFilterChange({
            ...advancedFilters,
            genre: updatedGenres
        });
    };

    const handleFilterChange = (key: keyof AdvancedFilters, value: string) => {
        onAdvancedFilterChange({
            ...advancedFilters,
            [key]: value
        });
    };

    return (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="space-y-6">
                {/* Basic Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Media Type Filters */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Media Type
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {mediaTypes.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => handleTypeToggle(type.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                                        selectedTypes.includes(type.id)
                                            ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Sort By
                        </h3>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => onSortChange(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                    {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    Advanced Filters
                </button>

                {/* Advanced Filters */}
                {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {/* Genres */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Genres
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {genres.map(genre => (
                                    <label
                                        key={genre}
                                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={(advancedFilters.genre || []).includes(genre)}
                                            onChange={() => handleGenreToggle(genre)}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        {genre}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Year and Rating */}
                        <div className="space-y-4">
                            {/* Year */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Release Year
                                </h3>
                                <select
                                    value={advancedFilters.year || ''}
                                    onChange={(e) => handleFilterChange('year', e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                >
                                    <option value="">Any Year</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Rating */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Minimum Rating
                                </h3>
                                <select
                                    value={advancedFilters.rating || ''}
                                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                >
                                    <option value="">Any Rating</option>
                                    {ratings.map(rating => (
                                        <option key={rating.value} value={rating.value}>
                                            {rating.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Language and Runtime */}
                        <div className="space-y-4">
                            {/* Language */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Language
                                </h3>
                                <select
                                    value={advancedFilters.language || ''}
                                    onChange={(e) => handleFilterChange('language', e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                >
                                    <option value="">Any Language</option>
                                    {languages.map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Runtime */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Runtime
                                </h3>
                                <select
                                    value={advancedFilters.runtime || ''}
                                    onChange={(e) => handleFilterChange('runtime', e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                                >
                                    <option value="">Any Length</option>
                                    {runtimes.map(runtime => (
                                        <option key={runtime.value} value={runtime.value}>
                                            {runtime.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchFilters; 