import { TextAnalyzer } from '../nlp/textAnalyzer.mjs';

export class MoodAnalyzer {
  constructor() {
    this.textAnalyzer = new TextAnalyzer();
  }

  async analyzeMood(text) {
    const analysis = this.textAnalyzer.analyzeText(text);
    return {
      sentiment: analysis.sentiment,
      mood: this.inferMood(analysis),
      intensity: this.calculateIntensity(analysis)
    };
  }

  inferMood(analysis) {
    const { sentiment, tokens } = analysis;
    
    // Mood categories with associated keywords
    const moodPatterns = {
      happy: ['happy', 'joy', 'excited', 'fun', 'cheerful'],
      relaxed: ['calm', 'peaceful', 'gentle', 'soothing'],
      adventurous: ['adventure', 'action', 'thrill', 'exciting'],
      romantic: ['love', 'romance', 'sweet', 'emotional'],
      thoughtful: ['deep', 'meaningful', 'philosophical', 'thought-provoking'],
      nostalgic: ['classic', 'nostalgic', 'memory', 'reminisce']
    };

    // Score each mood based on keyword matches and sentiment
    const moodScores = Object.entries(moodPatterns).map(([mood, keywords]) => {
      const matchCount = tokens.filter(token => 
        keywords.some(keyword => token.includes(keyword))
      ).length;
      
      return {
        mood,
        score: matchCount * (sentiment + 1) // Adjust score based on sentiment
      };
    });

    // Return the highest scoring mood
    return moodScores.sort((a, b) => b.score - a.score)[0].mood;
  }

  calculateIntensity(analysis) {
    const { tokens, sentiment } = analysis;
    
    // Intensity modifiers
    const intensifiers = ['very', 'extremely', 'really', 'totally', 'absolutely'];
    const intensifierCount = tokens.filter(token => 
      intensifiers.includes(token)
    ).length;

    // Calculate intensity based on sentiment strength and intensifiers
    return Math.min(
      1,
      (Math.abs(sentiment) + intensifierCount * 0.2)
    );
  }
}