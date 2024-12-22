import { WordVectors } from 'word2vec';

export class WordEmbeddingService {
  constructor() {
    this.model = null;
    this.vectorSize = 100;
  }

  async initialize() {
    try {
      // Load pre-trained word vectors
      this.model = await WordVectors.load('./data/word-vectors.txt');
    } catch (error) {
      console.error('Failed to load word vectors:', error);
      // Fallback to simpler text analysis if model fails to load
    }
  }

  async getTextEmbedding(text) {
    if (!this.model) return null;

    const words = text.toLowerCase().split(/\s+/);
    const vectors = words
      .map(word => this.model.get(word))
      .filter(vector => vector != null);

    if (vectors.length === 0) return null;

    // Calculate average vector
    return vectors.reduce((acc, vec) => {
      for (let i = 0; i < this.vectorSize; i++) {
        acc[i] = (acc[i] || 0) + vec[i];
      }
      return acc;
    }, new Array(this.vectorSize).fill(0))
      .map(val => val / vectors.length);
  }

  async getSimilarWords(word, n = 10) {
    if (!this.model) return [];
    
    try {
      return this.model.nearest(word, n);
    } catch (error) {
      console.error(`Failed to find similar words for "${word}":`, error);
      return [];
    }
  }
}