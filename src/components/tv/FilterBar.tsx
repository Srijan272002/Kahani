import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface FilterOptions {
    sort: string;
    genre: string;
    year: string;
    rating: string;
}

interface FilterBarProps {
    options: FilterOptions;
    onFilterChange: (key: keyof FilterOptions, value: string) => void;
    genres: string[];
    years: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({ options, onFilterChange, genres, years }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Sort */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sort By
                    </label>
                    <div className="relative">
                        <select
                            value={options.sort}
                            onChange={(e) => onFilterChange('sort', e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        >
                            <option value="popularity">Popularity</option>
                            <option value="rating">Rating</option>
                            <option value="latest">Latest</option>
                            <option value="oldest">Oldest</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* Genre Filter */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Genre
                    </label>
                    <div className="relative">
                        <select
                            value={options.genre}
                            onChange={(e) => onFilterChange('genre', e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        >
                            <option value="">All Genres</option>
                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* Year Filter */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Year
                    </label>
                    <div className="relative">
                        <select
                            value={options.year}
                            onChange={(e) => onFilterChange('year', e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        >
                            <option value="">All Years</option>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* Rating Filter */}
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rating
                    </label>
                    <div className="relative">
                        <select
                            value={options.rating}
                            onChange={(e) => onFilterChange('rating', e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        >
                            <option value="">All Ratings</option>
                            <option value="9">9+ Rating</option>
                            <option value="8">8+ Rating</option>
                            <option value="7">7+ Rating</option>
                            <option value="6">6+ Rating</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar; 