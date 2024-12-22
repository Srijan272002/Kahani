import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome back, {user?.name}!
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        This is your personal dashboard where you can discover and track your entertainment.
      </p>
    </div>
  );
};

export default Home; 