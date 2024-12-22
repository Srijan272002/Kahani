export interface MediaItem {
  id: string;
  title: string;
  type: 'movie' | 'tv' | 'book';
  year?: string;
  poster?: string;
  rating?: number;
  progress?: number;
  genres?: string[];
  description?: string;
}

export interface RecommendationGroup {
  theme: string;
  items: MediaItem[];
}

export interface RecommendationSet {
  movies: MediaItem[];
  tvShows: MediaItem[];
  books: MediaItem[];
  crossMedia: RecommendationGroup[];
}

export interface UserStats {
  totalContent: number;
  weeklyTime: string;
  currentStreak: number;
  aiRecommendations: number;
}

export interface ProgressItem {
  title: string;
  progress: number;
  type: 'movie' | 'tv' | 'book';
  id: string;
}