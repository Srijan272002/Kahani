export function extractFeatures(item) {
  const features = new Set();
  
  // Extract year features
  if (item.year) {
    const decade = Math.floor(parseInt(item.year) / 10) * 10;
    features.add(`decade_${decade}s`);
  }
  
  // Extract genre features
  if (item.genre) {
    const genres = Array.isArray(item.genre) 
      ? item.genre 
      : item.genre.split(',').map(g => g.trim());
    
    genres.forEach(genre => features.add(`genre_${genre.toLowerCase()}`));
  }
  
  // Extract title keywords
  if (item.title) {
    const keywords = extractKeywords(item.title);
    keywords.forEach(keyword => features.add(`keyword_${keyword}`));
  }
  
  return Array.from(features);
}

function extractKeywords(title) {
  // Remove common words and special characters
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => !stopWords.has(word) && word.length > 2);
}