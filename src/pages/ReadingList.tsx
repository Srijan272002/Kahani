import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  author: {
    name: string;
    avatar: string | null;
  };
  publishedAt: string;
  readTime: number;
}

const ReadingList: React.FC = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReadingList = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/reading-list`,
          {
            withCredentials: true
          }
        );
        setArticles(response.data.data);
      } catch (err) {
        setError('Failed to fetch reading list. Please try again later.');
        console.error('Error fetching reading list:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReadingList();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please log in to view your reading list.
          </p>
          <Link
            to="/"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleRemoveArticle = async (articleId: string) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/users/reading-list/${articleId}`,
        {
          withCredentials: true
        }
      );
      setArticles(articles.filter(article => article.id !== articleId));
    } catch (err) {
      console.error('Error removing article:', err);
      // Show error message to user
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Reading List
      </h1>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your reading list is empty.
          </p>
          <Link
            to="/articles"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Browse Articles
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              <div className="flex">
                {article.coverImage && (
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-48 h-32 object-cover"
                  />
                )}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {article.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <img
                            src={article.author.avatar || '/placeholder-avatar.png'}
                            alt={article.author.name}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span>{article.author.name}</span>
                        </div>
                        <span className="mx-2">•</span>
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>{article.readTime} min read</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveArticle(article.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                      title="Remove from reading list"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadingList; 