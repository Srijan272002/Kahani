import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../types';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

interface SimilarBooksProps {
    bookId: string;
}

const SimilarBooks: React.FC<SimilarBooksProps> = ({ bookId }) => {
    const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSimilarBooks = async () => {
            try {
                const response = await axios.get(`/api/books/${bookId}/similar`);
                setSimilarBooks(response.data);
            } catch (err) {
                setError('Failed to load similar books');
                console.error('Error fetching similar books:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSimilarBooks();
    }, [bookId]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="text-center text-red-500 dark:text-red-400">
                {error}
            </div>
        );
    }

    if (similarBooks.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400">
                No similar books found.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {similarBooks.map((book) => (
                <Link
                    key={book.id}
                    to={`/books/${book.id}`}
                    className="group"
                >
                    <div className="relative aspect-[2/3] mb-2">
                        <img
                            src={book.imageLinks.thumbnail || book.imageLinks.small}
                            alt={book.title}
                            className="w-full h-full object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 rounded-lg" />
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
                        {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
                        {book.authors.join(', ')}
                    </p>
                    <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" size={12} />
                        <span className="text-sm">
                            {book.averageRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({book.ratingsCount})
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default SimilarBooks; 