import { useState } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { MediaGrid } from '../recommendations/MediaGrid';
import type { MediaItem } from '../../types';

export function MoodBasedRecommendations() {
  const [moodText, setMoodText] = useState('');
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMoodSubmit = async () => {
    if (!moodText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ text: moodText })
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
      setMoodText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          AI Mood Matcher
        </h2>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Tell us how you're feeling, and we'll find the perfect entertainment for your mood.
      </p>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="e.g., 'Looking for something uplifting after a long day'"
            className="w-full pl-4 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleMoodSubmit()}
          />
        </div>
        <button
          onClick={handleMoodSubmit}
          disabled={loading || !moodText.trim()}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          <span>Match</span>
        </button>
      </div>

      {error && (
        <div className="text-red-500 dark:text-red-400 mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-pulse text-gray-600 dark:text-gray-300">
            Finding the perfect recommendations...
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <MediaGrid
          title="Based on Your Mood"
          items={recommendations}
          explanation="AI-powered recommendations"
        />
      )}
    </div>
  );
}