import { db } from '../../config/database.mjs';

export class UserPreferences {
  async getPreferences(userId) {
    const stmt = db.prepare(`
      SELECT 
        preference_key,
        preference_value,
        weight
      FROM user_preferences
      WHERE user_id = ?
    `);
    
    return stmt.all(userId);
  }

  async updatePreference(userId, key, value, weight = 1.0) {
    const stmt = db.prepare(`
      INSERT INTO user_preferences (user_id, preference_key, preference_value, weight)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, preference_key) 
      DO UPDATE SET preference_value = ?, weight = ?
    `);
    
    return stmt.run(userId, key, value, weight, value, weight);
  }

  async inferPreferences(userId) {
    // Analyze user behavior to infer preferences
    const interactions = await this.getUserInteractions(userId);
    const preferences = this.analyzeInteractions(interactions);
    
    // Update inferred preferences
    for (const [key, value] of Object.entries(preferences)) {
      await this.updatePreference(userId, key, value.value, value.weight);
    }
    
    return preferences;
  }

  async getUserInteractions(userId) {
    const stmt = db.prepare(`
      SELECT 
        'rating' as type,
        r.media_id,
        r.value,
        w.genre,
        w.year
      FROM ratings r
      JOIN wishlist w ON r.media_id = w.media_id
      WHERE r.user_id = ?
      UNION ALL
      SELECT 
        'wishlist' as type,
        media_id,
        1 as value,
        genre,
        year
      FROM wishlist
      WHERE user_id = ?
    `);
    
    return stmt.all(userId, userId);
  }

  analyzeInteractions(interactions) {
    const preferences = {};
    
    interactions.forEach(interaction => {
      // Genre preferences
      if (interaction.genre) {
        const genres = interaction.genre.split(',').map(g => g.trim());
        genres.forEach(genre => {
          const key = `genre_${genre.toLowerCase()}`;
          if (!preferences[key]) {
            preferences[key] = { count: 0, total: 0 };
          }
          preferences[key].count++;
          preferences[key].total += interaction.value;
        });
      }
      
      // Era preferences
      if (interaction.year) {
        const decade = Math.floor(parseInt(interaction.year) / 10) * 10;
        const key = `era_${decade}s`;
        if (!preferences[key]) {
          preferences[key] = { count: 0, total: 0 };
        }
        preferences[key].count++;
        preferences[key].total += interaction.value;
      }
    });
    
    // Calculate weighted preferences
    return Object.entries(preferences).reduce((acc, [key, data]) => {
      acc[key] = {
        value: data.total / data.count,
        weight: Math.min(data.count / 10, 1) // Cap weight at 1.0
      };
      return acc;
    }, {});
  }
}