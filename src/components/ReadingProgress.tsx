import React, { useState } from 'react';
import { FaBookReader } from 'react-icons/fa';

interface ReadingProgressProps {
    currentPage: number;
    totalPages: number;
    onPageUpdate: (page: number) => void;
}

const ReadingProgress: React.FC<ReadingProgressProps> = ({
    currentPage,
    totalPages,
    onPageUpdate
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempPage, setTempPage] = useState(currentPage);

    const progress = (currentPage / totalPages) * 100;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (tempPage >= 0 && tempPage <= totalPages) {
            onPageUpdate(tempPage);
            setIsEditing(false);
        }
    };

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FaBookReader />
                    Reading Progress
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(progress)}% Complete
                </span>
            </div>

            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                <div
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex items-center justify-between">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <input
                            type="number"
                            value={tempPage}
                            onChange={(e) => setTempPage(Number(e.target.value))}
                            min={0}
                            max={totalPages}
                            className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span>of {totalPages}</span>
                        <button
                            type="submit"
                            className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setTempPage(currentPage);
                                setIsEditing(false);
                            }}
                            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </form>
                ) : (
                    <div className="flex items-center gap-2">
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => {
                                setTempPage(currentPage);
                                setIsEditing(true);
                            }}
                            className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                            Update Progress
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReadingProgress; 