import natural from 'natural';
import { stopwords } from './stopwords.js';

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const stemmer = natural.PorterStemmer;

export class TextAnalyzer {
  constructor() {
    this.tfidf = new TfIdf();
    this.sentimentAnalyzer = new natural.SentimentAnalyzer(
      'English', 
      stemmer, 
      'afinn'
    );
  }

  analyzeText(text) {
    const tokens = this.tokenize(text);
    const stems = this.stem(tokens);
    const sentiment = this.analyzeSentiment(text);
    const entities = this.extractEntities(text);
    
    return {
      tokens,
      stems,
      sentiment,
      entities,
      keywords: this.extractKeywords(text)
    };
  }

  tokenize(text) {
    return tokenizer
      .tokenize(text.toLowerCase())
      .filter(token => !stopwords.has(token));
  }

  stem(tokens) {
    return tokens.map(token => stemmer.stem(token));
  }

  analyzeSentiment(text) {
    const tokens = this.tokenize(text);
    return this.sentimentAnalyzer.getSentiment(tokens);
  }

  extractEntities(text) {
    const entities = new Set();
    const matches = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
    matches.forEach(match => entities.add(match));
    return Array.from(entities);
  }

  extractKeywords(text) {
    this.tfidf.addDocument(text);
    const terms = [];
    
    this.tfidf.listTerms(0).forEach(item => {
      if (item.tfidf > 0.5) {
        terms.push({ term: item.term, score: item.tfidf });
      }
    });

    return terms;
  }
}