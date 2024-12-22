import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { useRecommendations } from '../hooks/useRecommendations';
import { MoodBasedRecommendations } from '../components/ai/MoodBasedRecommendations';
import { MediaGrid } from '../components/recommendations/MediaGrid';
import { Search, Bell, Sun, Moon, User, BookOpen, Film, Tv } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const {
    topRecommendations,
    bookRecommendations,
    movieRecommendations,
    tvRecommendations 
  } = useRecommendations();

  const stats = {
    totalContent: 156,
    weeklyTime: '23h 45m',
    currentStreak: 12,
    aiRecommendations: 42
  };

  const inProgress = {
    books: [
      { title: 'The Midnight Library', progress: 65 },
      { title: 'Project Hail Mary', progress: 32 }
    ],
    shows: [
      { title: 'The Last of Us', progress: 80 },
      { title: 'House of the Dragon', progress: 45 }
    ],
    movies: [
      { title: 'Dune: Part Two', progress: 0 },
      { title: 'Oppenheimer', progress: 0 }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-2xl">
                <input
                  type="text"
                  placeholder="Search for movies, books, or TV shows..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button 
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                onClick={toggleDarkMode}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>
              <div className="flex items-center gap-2">
                <img
                  src={user?.photoURL || '/default-avatar.png'}
                  alt="Profile"
                  className="h-8 w-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.displayName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Content</h3>
              <BookOpen className="h-5 w-5 text-blue-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.totalContent}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Weekly Time</h3>
              <Film className="h-5 w-5 text-green-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.weeklyTime}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Streak</h3>
              <Tv className="h-5 w-5 text-purple-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.currentStreak} days</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Recommendations</h3>
              <User className="h-5 w-5 text-red-500" />
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{stats.aiRecommendations}</p>
          </div>
        </div>

        {/* Content Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(inProgress).map(([category, items]) => (
            <div key={category} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 capitalize">
                {category}
              </h3>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{item.title}</span>
                      <span className="text-gray-900 dark:text-white">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* AI Insights */}
        <div className="mb-8">
          <MoodBasedRecommendations />
        </div>

        {/* Recommendations */}
        <div className="space-y-8">
          <MediaGrid title="Trending Now" items={topRecommendations} />
          <MediaGrid title="Recommended Movies" items={movieRecommendations} />
          <MediaGrid title="Recommended TV Shows" items={tvRecommendations} />
          <MediaGrid title="Recommended Books" items={bookRecommendations} />
        </div>
      </main>
    </div>
  );
} 