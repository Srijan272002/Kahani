export class ContentFilter {
  constructor(db) {
    this.db = db;
  }

  async filterByMood(items, mood) {
    const moodMappings = {
      happy: {
        genres: ['Comedy', 'Animation', 'Family'],
        keywords: ['fun', 'uplifting', 'heartwarming']
      },
      relaxed: {
        genres: ['Documentary', 'Nature', 'Slice of Life'],
        keywords: ['peaceful', 'gentle', 'calm']
      },
      adventurous: {
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        keywords: ['exciting', 'thrilling', 'epic']
      },
      romantic: {
        genres: ['Romance', 'Drama'],
        keywords: ['love', 'relationship', 'emotional']
      },
      thoughtful: {
        genres: ['Drama', 'Documentary', 'Mystery'],
        keywords: ['deep', 'meaningful', 'thought-provoking']
      },
      nostalgic: {
        genres: ['Classic', 'Period Drama', 'Historical'],
        keywords: ['classic', 'timeless', 'memorable']
      }
    };

    const moodPreferences = moodMappings[mood] || moodMappings.happy;

    return items.filter(item => {
      const genres = item.genre?.split(',').map(g => g.trim()) || [];
      const hasMatchingGenre = genres.some(g => 
        moodPreferences.genres.includes(g)
      );
      
      const description = item.description?.toLowerCase() || '';
      const hasMatchingKeyword = moodPreferences.keywords.some(
        keyword => description.includes(keyword)
      );

      return hasMatchingGenre || hasMatchingKeyword;
    });
  }

  async applyUserPreferences(items, userPreferences) {
    return items.map(item => ({
      ...item,
      score: this.calculatePreferenceScore(item, userPreferences)
    })).sort((a, b) => b.score - a.score);
  }

  calculatePreferenceScore(item, preferences) {
    let score = 0;
    const weights = {
      genre: 0.4,
      era: 0.3,
      rating: 0.3
    };

    // Genre matching
    if (item.genre && preferences.genres) {
      const genres = item.genre.split(',').map(g => g.trim());
      const genreScore = genres.reduce((sum, genre) => {
        return sum + (preferences.genres[genre.toLowerCase()] || 0);
      }, 0) / genres.length;
      score += genreScore * weights.genre;
    }

    // Era matching
    if (item.year && preferences.eras) {
      const decade = Math.floor(parseInt(item.year) / 10) * 10;
      const eraScore = preferences.eras[`${decade}s`] || 0;
      score += eraScore * weights.era;
    }

    // Rating influence
    if (item.rating && preferences.ratingStyle) {
      const ratingScore = Math.abs(item.rating - preferences.ratingStyle.average);
      score += (1 - ratingScore / 5) * weights.rating;
    }

    return score;
  }
}