import React from 'react';
import { ChevronDown, Filter } from 'lucide-react';

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
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Sort */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sort By
                    </label>
                    <select
                        value={options.sort}
                        onChange={(e) => onFilterChange('sort', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="popularity">Popularity</option>
                        <option value="rating">Rating</option>
                        <option value="releaseDate">Release Date</option>
                        <option value="title">Title</option>
                    </select>
                </div>

                {/* Genre */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Genre
                    </label>
                    <select
                        value={options.genre}
                        onChange={(e) => onFilterChange('genre', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Genres</option>
                        {genres.map((genre) => (
                            <option key={genre} value={genre}>
                                {genre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Year */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Year
                    </label>
                    <select
                        value={options.year}
                        onChange={(e) => onFilterChange('year', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">All Years</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Rating */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Minimum Rating
                    </label>
                    <select
                        value={options.rating}
                        onChange={(e) => onFilterChange('rating', e.target.value)}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="">Any Rating</option>
                        <option value="7">7+ ★</option>
                        <option value="8">8+ ★</option>
                        <option value="9">9+ ★</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default FilterBar; 