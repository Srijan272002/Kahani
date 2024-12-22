import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Welcome to Kahani
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-center max-w-2xl">
            Your personal entertainment companion for discovering and tracking movies, TV shows, and books.
          </p>
          
          {user ? (
            <Link
              to="/app"
              className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing; 