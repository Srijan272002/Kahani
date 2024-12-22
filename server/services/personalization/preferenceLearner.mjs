export class PreferenceLearner {
  constructor(db) {
    this.db = db;
  }

  async learnFromInteractions(userId) {
    const interactions = await this.getUserInteractions(userId);
    const patterns = this.analyzePatterns(interactions);
    const preferences = this.inferPreferences(patterns);
    
    await this.updateUserPreferences(userId, preferences);
    return preferences;
  }

  async getUserInteractions(userId) {
    const stmt = this.db.prepare(`
      SELECT 
        'rating' as type,
        r.media_id,
        r.value,
        w.genre,
        w.year,
        w.title,
        r.created_at
      FROM ratings r
      JOIN wishlist w ON r.media_id = w.media_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
      LIMIT 100
    `);

    return stmt.all(userId);
  }

  analyzePatterns(interactions) {
    return {
      genres: this.analyzeGenrePatterns(interactions),
      temporal: this.analyzeTemporalPatterns(interactions),
      ratings: this.analyzeRatingPatterns(interactions)
    };
  }

  analyzeGenrePatterns(interactions) {
    const genreCounts = {};
    const genreRatings = {};

    interactions.forEach(interaction => {
      if (!interaction.genre) return;

      const genres = interaction.genre.split(',').map(g => g.trim());
      const rating = interaction.value || 1;

      genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        genreRatings[genre] = (genreRatings[genre] || 0) + rating;
      });
    });

    return Object.entries(genreCounts).map(([genre, count]) => ({
      genre,
      count,
      avgRating: genreRatings[genre] / count,
      weight: Math.min(count / 10, 1)
    }));
  }

  analyzeTemporalPatterns(interactions) {
    const yearCounts = {};
    const yearRatings = {};

    interactions.forEach(interaction => {
      if (!interaction.year) return;

      const decade = Math.floor(parseInt(interaction.year) / 10) * 10;
      const rating = interaction.value || 1;

      yearCounts[decade] = (yearCounts[decade] || 0) + 1;
      yearRatings[decade] = (yearRatings[decade] || 0) + rating;
    });

    return Object.entries(yearCounts).map(([decade, count]) => ({
      decade,
      count,
      avgRating: yearRatings[decade] / count,
      weight: Math.min(count / 5, 1)
    }));
  }

  analyzeRatingPatterns(interactions) {
    const ratings = interactions
      .filter(i => i.value)
      .map(i => i.value);

    if (ratings.length === 0) return null;

    return {
      average: ratings.reduce((a, b) => a + b, 0) / ratings.length,
      distribution: this.calculateRatingDistribution(ratings),
      consistency: this.calculateRatingConsistency(ratings)
    };
  }

  calculateRatingDistribution(ratings) {
    const distribution = new Array(5).fill(0);
    ratings.forEach(rating => distribution[Math.floor(rating) - 1]++);
    return distribution.map(count => count / ratings.length);
  }

  calculateRatingConsistency(ratings) {
    if (ratings.length < 2) return 1;

    const variance = ratings.reduce((sum, rating) => {
      const diff = rating - ratings[0];
      return sum + diff * diff;
    }, 0) / (ratings.length - 1);

    return 1 / (1 + Math.sqrt(variance));
  }

  inferPreferences(patterns) {
    return {
      genres: this.inferGenrePreferences(patterns.genres),
      eras: this.inferEraPreferences(patterns.temporal),
      ratingStyle: this.inferRatingStyle(patterns.ratings)
    };
  }

  async updateUserPreferences(userId, preferences) {
    const stmt = this.db.prepare(`
      INSERT INTO user_preferences (user_id, preference_key, preference_value, weight)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, preference_key) 
      DO UPDATE SET preference_value = ?, weight = ?
    `);

    const batch = this.db.prepare('BEGIN TRANSACTION');

    try {
      // Update genre preferences
      for (const genre of preferences.genres) {
        stmt.run(
          userId,
          `genre_${genre.name}`,
          genre.score,
          genre.weight,
          genre.score,
          genre.weight
        );
      }

      // Update era preferences
      for (const era of preferences.eras) {
        stmt.run(
          userId,
          `era_${era.decade}s`,
          era.score,
          era.weight,
          era.score,
          era.weight
        );
      }

      batch.run('COMMIT');
    } catch (error) {
      batch.run('ROLLBACK');
      throw error;
    }
  }
}