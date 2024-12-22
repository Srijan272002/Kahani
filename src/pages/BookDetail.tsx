import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, BookNote, Bookmark } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import { FaBookmark, FaRegBookmark, FaHeart, FaRegHeart, FaBook, FaClock, FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';
import Rating from '../components/Rating';
import SimilarBooks from '../components/SimilarBooks';
import ReadingProgress from '../components/ReadingProgress';
import BookNotes from '../components/BookNotes';

const BookDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { isInWishlist, toggleWishlist } = useWishlist();
    
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [notes, setNotes] = useState<BookNote[]>([]);
    const [showAddNote, setShowAddNote] = useState(false);
    const [newNote, setNewNote] = useState({ page: 0, content: '', color: '#ffffff' });

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await axios.get(`/api/books/${id}`);
                setBook(response.data);
                if (response.data.userProgress) {
                    setCurrentPage(response.data.userProgress.currentPage);
                    setBookmarks(response.data.userProgress.bookmarks || []);
                    setNotes(response.data.userProgress.notes || []);
                }
            } catch (error) {
                toast.error('Failed to load book details');
                console.error('Error fetching book details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookDetails();
    }, [id]);

    const handlePageUpdate = async (page: number) => {
        try {
            await axios.post(`/api/books/${id}/progress`, { currentPage: page });
            setCurrentPage(page);
            toast.success('Reading progress updated');
        } catch (error) {
            toast.error('Failed to update reading progress');
        }
    };

    const handleToggleBookmark = async () => {
        try {
            const response = await axios.post(`/api/books/${id}/bookmarks`, {
                page: currentPage,
                title: `Page ${currentPage}`
            });
            setBookmarks([...bookmarks, response.data]);
            toast.success('Bookmark added');
        } catch (error) {
            toast.error('Failed to add bookmark');
        }
    };

    const handleAddNote = async () => {
        try {
            const response = await axios.post(`/api/books/${id}/notes`, newNote);
            setNotes([...notes, response.data]);
            setShowAddNote(false);
            setNewNote({ page: 0, content: '', color: '#ffffff' });
            toast.success('Note added');
        } catch (error) {
            toast.error('Failed to add note');
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!book) {
        return <div className="text-center">Book not found</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Book Cover and Basic Info */}
                <div className="md:col-span-1">
                    <img
                        src={book.imageLinks.large || book.imageLinks.medium || book.imageLinks.thumbnail}
                        alt={book.title}
                        className="w-full rounded-lg shadow-lg"
                    />
                    <div className="mt-4 flex justify-between items-center">
                        <button
                            onClick={() => toggleWishlist(book.id, 'book')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
                        >
                            {isInWishlist(book.id) ? <FaHeart /> : <FaRegHeart />}
                            {isInWishlist(book.id) ? 'In Wishlist' : 'Add to Wishlist'}
                        </button>
                        <button
                            onClick={handleToggleBookmark}
                            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            {bookmarks.some(b => b.page === currentPage) ? <FaBookmark /> : <FaRegBookmark />}
                        </button>
                    </div>
                </div>

                {/* Book Details */}
                <div className="md:col-span-2">
                    <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
                    {book.subtitle && (
                        <h2 className="text-xl text-gray-600 dark:text-gray-400 mb-4">{book.subtitle}</h2>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <Rating value={book.averageRating} />
                            <span>({book.ratingsCount} ratings)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaBook />
                            <span>{book.pageCount} pages</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaClock />
                            <span>Published: {new Date(book.publishedDate).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Authors</h3>
                        <div className="flex flex-wrap gap-2">
                            {book.authors.map((author, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm"
                                >
                                    {author}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-gray-700 dark:text-gray-300">{book.description}</p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                            {book.categories.map((category, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                                >
                                    {category}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Reading Progress */}
                    <ReadingProgress
                        currentPage={currentPage}
                        totalPages={book.pageCount}
                        onPageUpdate={handlePageUpdate}
                    />

                    {/* Notes Section */}
                    <BookNotes
                        notes={notes}
                        showAddNote={showAddNote}
                        setShowAddNote={setShowAddNote}
                        newNote={newNote}
                        setNewNote={setNewNote}
                        onAddNote={handleAddNote}
                    />
                </div>
            </div>

            {/* Similar Books */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Similar Books You Might Like</h2>
                <SimilarBooks bookId={book.id} />
            </div>
        </div>
    );
};

export default BookDetail; 