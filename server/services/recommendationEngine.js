import { cosinesim } from '../utils/similarity.js';
import { db } from '../config/database.js';
import { extractFeatures } from '../utils/featureExtraction.js';

class RecommendationEngine {
  constructor() {
    this.contentBasedCache = new Map();
    this.collaborativeCache = new Map();
  }

  async getRecommendations(userId, mediaType) {
    const userPreferences = await this.getUserPreferences(userId);
    const contentBased = await this.getContentBasedRecommendations(userId, mediaType);
    const collaborative = await this.getCollaborativeRecommendations(userId, mediaType);
    
    return this.hybridMerge(contentBased, collaborative, userPreferences);
  }

  async getUserPreferences(userId) {
    const stmt = db.prepare(`
      SELECT 
        w.media_type,
        w.media_id,
        r.value as rating,
        w.title,
        w.genre,
        w.year
      FROM wishlist w
      LEFT JOIN ratings r ON w.media_id = r.media_id AND w.user_id = r.user_id
      WHERE w.user_id = ?
    `);
    
    return stmt.all(userId);
  }

  async getContentBasedRecommendations(userId, mediaType) {
    const cacheKey = `${userId}-${mediaType}-content`;
    if (this.contentBasedCache.has(cacheKey)) {
      return this.contentBasedCache.get(cacheKey);
    }

    const userPreferences = await this.getUserPreferences(userId);
    const userProfile = this.buildUserProfile(userPreferences);
    
    const candidates = await this.getCandidateItems(mediaType);
    const recommendations = candidates
      .map(item => ({
        ...item,
        score: this.calculateContentScore(item, userProfile)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    this.contentBasedCache.set(cacheKey, recommendations);
    return recommendations;
  }

  async getCollaborativeRecommendations(userId, mediaType) {
    const cacheKey = `${userId}-${mediaType}-collab`;
    if (this.collaborativeCache.has(cacheKey)) {
      return this.collaborativeCache.get(cacheKey);
    }

    const similarUsers = await this.findSimilarUsers(userId);
    const recommendations = await this.getRecommendationsFromSimilarUsers(
      similarUsers,
      userId,
      mediaType
    );

    this.collaborativeCache.set(cacheKey, recommendations);
    return recommendations;
  }

  buildUserProfile(preferences) {
    return preferences.reduce((profile, item) => {
      const features = extractFeatures(item);
      features.forEach(feature => {
        profile[feature] = (profile[feature] || 0) + (item.rating || 1);
      });
      return profile;
    }, {});
  }

  async getCandidateItems(mediaType) {
    const stmt = db.prepare(`
      SELECT DISTINCT 
        w.media_id,
        w.title,
        w.media_type,
        w.year,
        w.genre,
        AVG(r.value) as avg_rating,
        COUNT(r.id) as rating_count
      FROM wishlist w
      LEFT JOIN ratings r ON w.media_id = r.media_id
      WHERE w.media_type = ?
      GROUP BY w.media_id
      HAVING rating_count >= 3
    `);
    
    return stmt.all(mediaType);
  }

  calculateContentScore(item, userProfile) {
    const itemFeatures = extractFeatures(item);
    let score = 0;
    
    itemFeatures.forEach(feature => {
      if (userProfile[feature]) {
        score += userProfile[feature];
      }
    });
    
    return score * (item.avg_rating || 1);
  }

  async findSimilarUsers(userId) {
    const userRatings = await this.getUserRatings(userId);
    const otherUsers = await this.getOtherUsersRatings(userId);
    
    return otherUsers
      .map(other => ({
        userId: other.userId,
        similarity: cosinesim(userRatings, other.ratings)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  async getUserRatings(userId) {
    const stmt = db.prepare('SELECT media_id, value FROM ratings WHERE user_id = ?');
    return stmt.all(userId);
  }

  async getOtherUsersRatings(excludeUserId) {
    const stmt = db.prepare(`
      SELECT user_id, media_id, value 
      FROM ratings 
      WHERE user_id != ?
    `);
    
    const ratings = stmt.all(excludeUserId);
    
    return Object.values(ratings.reduce((acc, rating) => {
      if (!acc[rating.user_id]) {
        acc[rating.user_id] = { userId: rating.user_id, ratings: [] };
      }
      acc[rating.user_id].ratings.push({
        mediaId: rating.media_id,
        value: rating.value
      });
      return acc;
    }, {}));
  }

  async getRecommendationsFromSimilarUsers(similarUsers, userId, mediaType) {
    const stmt = db.prepare(`
      SELECT 
        w.media_id,
        w.title,
        w.media_type,
        w.year,
        w.genre,
        r.value as rating
      FROM wishlist w
      INNER JOIN ratings r ON w.media_id = r.media_id
      WHERE r.user_id = ? AND w.media_type = ?
      AND w.media_id NOT IN (
        SELECT media_id FROM wishlist WHERE user_id = ?
      )
    `);

    const recommendations = [];
    for (const user of similarUsers) {
      const userRecs = stmt.all(user.userId, mediaType, userId);
      recommendations.push(...userRecs.map(rec => ({
        ...rec,
        score: rec.rating * user.similarity
      })));
    }

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  hybridMerge(contentBased, collaborative, userPreferences) {
    const CONTENT_WEIGHT = 0.6;
    const COLLAB_WEIGHT = 0.4;

    const merged = new Map();

    // Merge content-based recommendations
    contentBased.forEach(item => {
      merged.set(item.media_id, {
        ...item,
        score: item.score * CONTENT_WEIGHT
      });
    });

    // Merge collaborative recommendations
    collaborative.forEach(item => {
      if (merged.has(item.media_id)) {
        const existing = merged.get(item.media_id);
        existing.score += item.score * COLLAB_WEIGHT;
      } else {
        merged.set(item.media_id, {
          ...item,
          score: item.score * COLLAB_WEIGHT
        });
      }
    });

    return Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }
}

export const recommendationEngine = new RecommendationEngine();