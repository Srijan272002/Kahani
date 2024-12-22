export class InsightGenerator {
  constructor(db) {
    this.db = db;
  }

  async generateInsights(userId, recommendations) {
    const userProfile = await this.getUserProfile(userId);
    const insights = [];

    for (const recommendation of recommendations) {
      const insight = await this.analyzeRecommendation(recommendation, userProfile);
      insights.push(insight);
    }

    return this.prioritizeInsights(insights);
  }

  async getUserProfile(userId) {
    const [preferences, history] = await Promise.all([
      this.getUserPreferences(userId),
      this.getUserHistory(userId)
    ]);

    return { preferences, history };
  }

  async analyzeRecommendation(item, userProfile) {
    const contentFactors = await this.analyzeContentFactors(item, userProfile);
    const socialFactors = await this.analyzeSocialFactors(item);
    const personalFactors = this.analyzePersonalFactors(item, userProfile);

    return {
      item,
      insights: {
        content: contentFactors,
        social: socialFactors,
        personal: personalFactors
      },
      score: this.calculateInsightScore(contentFactors, socialFactors, personalFactors)
    };
  }

  async analyzeContentFactors(item, userProfile) {
    const factors = [];

    // Genre analysis
    if (item.genre && userProfile.preferences.genres) {
      const genreMatch = this.analyzeGenreMatch(item.genre, userProfile.preferences.genres);
      if (genreMatch.score > 0.5) {
        factors.push({
          type: 'genre',
          score: genreMatch.score,
          description: `Matches your favorite genres: ${genreMatch.matches.join(', ')}`
        });
      }
    }

    // Creator/Actor analysis
    if (item.creators) {
      const creatorMatch = await this.analyzeCreatorMatch(item.creators, userProfile.history);
      if (creatorMatch.score > 0.3) {
        factors.push({
          type: 'creator',
          score: creatorMatch.score,
          description: `Features ${creatorMatch.matches.join(' and ')}, whose work you've enjoyed`
        });
      }
    }

    return factors;
  }

  async analyzeSocialFactors(item) {
    const factors = [];

    // Rating distribution
    const ratings = await this.getItemRatings(item.id);
    if (ratings.count > 10) {
      factors.push({
        type: 'popularity',
        score: this.calculatePopularityScore(ratings),
        description: `Highly rated by ${ratings.count} users with ${Math.round(ratings.average * 100)}% positive reviews`
      });
    }

    // Similar users
    const similarUsers = await this.getSimilarUsersRating(item.id);
    if (similarUsers.length > 0) {
      factors.push({
        type: 'similar_users',
        score: similarUsers.length / 10,
        description: `Enjoyed by ${similarUsers.length} users with similar taste`
      });
    }

    return factors;
  }

  analyzePersonalFactors(item, userProfile) {
    const factors = [];

    // Viewing/Reading history patterns
    const historyPattern = this.analyzeHistoryPattern(item, userProfile.history);
    if (historyPattern.score > 0.4) {
      factors.push({
        type: 'history_pattern',
        score: historyPattern.score,
        description: historyPattern.description
      });
    }

    // Time-based recommendations
    const timeContext = this.analyzeTimeContext(item);
    if (timeContext.score > 0.3) {
      factors.push({
        type: 'time_context',
        score: timeContext.score,
        description: timeContext.description
      });
    }

    return factors;
  }

  calculateInsightScore(contentFactors, socialFactors, personalFactors) {
    const weights = {
      content: 0.4,
      social: 0.3,
      personal: 0.3
    };

    return (
      this.averageFactorScores(contentFactors) * weights.content +
      this.averageFactorScores(socialFactors) * weights.social +
      this.averageFactorScores(personalFactors) * weights.personal
    );
  }

  averageFactorScores(factors) {
    if (factors.length === 0) return 0;
    return factors.reduce((sum, factor) => sum + factor.score, 0) / factors.length;
  }

  prioritizeInsights(insights) {
    return insights
      .sort((a, b) => b.score - a.score)
      .map(insight => ({
        ...insight,
        primaryFactor: this.selectPrimaryFactor(insight.insights)
      }));
  }

  selectPrimaryFactor(insights) {
    const allFactors = [
      ...insights.content,
      ...insights.social,
      ...insights.personal
    ].sort((a, b) => b.score - a.score);

    return allFactors[0]?.description || 'Based on your interests';
  }
}