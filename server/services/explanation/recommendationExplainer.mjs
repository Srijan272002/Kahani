export class RecommendationExplainer {
  explainRecommendation(item, userProfile, similarUsers) {
    const explanations = [];
    
    // Content-based explanations
    const contentFactors = this.explainContentFactors(item, userProfile);
    if (contentFactors.length > 0) {
      explanations.push({
        type: 'content',
        factors: contentFactors
      });
    }
    
    // Collaborative explanations
    const collaborativeFactors = this.explainCollaborativeFactors(item, similarUsers);
    if (collaborativeFactors.length > 0) {
      explanations.push({
        type: 'collaborative',
        factors: collaborativeFactors
      });
    }
    
    // Popularity explanation
    if (item.rating_count > 10) {
      explanations.push({
        type: 'popularity',
        factor: `Rated ${item.avg_rating.toFixed(1)}/5 by ${item.rating_count} users`
      });
    }
    
    return {
      primary: this.selectPrimaryExplanation(explanations),
      details: explanations
    };
  }

  explainContentFactors(item, userProfile) {
    const factors = [];
    
    // Genre matching
    if (item.genre && userProfile.genres) {
      const matchingGenres = item.genre
        .split(',')
        .map(g => g.trim())
        .filter(genre => userProfile.genres[genre.toLowerCase()]);
      
      if (matchingGenres.length > 0) {
        factors.push({
          type: 'genre',
          description: `Similar to genres you enjoy: ${matchingGenres.join(', ')}`
        });
      }
    }
    
    // Era preference
    if (item.year && userProfile.eras) {
      const decade = Math.floor(parseInt(item.year) / 10) * 10;
      if (userProfile.eras[`${decade}s`]) {
        factors.push({
          type: 'era',
          description: `From the ${decade}s, a period you enjoy`
        });
      }
    }
    
    return factors;
  }

  explainCollaborativeFactors(item, similarUsers) {
    const factors = [];
    
    if (similarUsers && similarUsers.length > 0) {
      const ratingUsers = similarUsers
        .filter(user => user.ratings.some(r => r.mediaId === item.media_id));
      
      if (ratingUsers.length > 0) {
        factors.push({
          type: 'similar_users',
          description: `Enjoyed by ${ratingUsers.length} users with similar taste`
        });
      }
    }
    
    return factors;
  }

  selectPrimaryExplanation(explanations) {
    // Prioritize content-based explanations
    const contentExplanation = explanations.find(e => e.type === 'content');
    if (contentExplanation && contentExplanation.factors.length > 0) {
      return contentExplanation.factors[0].description;
    }
    
    // Fall back to collaborative explanations
    const collaborativeExplanation = explanations.find(e => e.type === 'collaborative');
    if (collaborativeExplanation && collaborativeExplanation.factors.length > 0) {
      return collaborativeExplanation.factors[0].description;
    }
    
    // Finally, use popularity if available
    const popularityExplanation = explanations.find(e => e.type === 'popularity');
    if (popularityExplanation) {
      return popularityExplanation.factor;
    }
    
    return 'Based on your interests';
  }
}