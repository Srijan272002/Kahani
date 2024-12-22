import React, { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';

interface SearchHistoryProps {
    onSearch: (term: string) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({ onSearch }) => {
    const [history, setHistory] = useState<string[]>([]);

    useEffect(() => {
        const savedHistory = localStorage.getItem('searchHistory');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    const handleClearHistory = () => {
        localStorage.removeItem('searchHistory');
        setHistory([]);
    };

    const handleRemoveItem = (term: string) => {
        const updatedHistory = history.filter(item => item !== term);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
        setHistory(updatedHistory);
    };

    if (history.length === 0) {
        return (
            <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                    Your search history will appear here
                </p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Recent Searches
                </h2>
                <button
                    onClick={handleClearHistory}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    Clear All
                </button>
            </div>

            <div className="space-y-2">
                {history.map((term, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <button
                            onClick={() => onSearch(term)}
                            className="flex items-center gap-3 flex-1 text-left"
                        >
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                                {term}
                            </span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveItem(term);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SearchHistory; 