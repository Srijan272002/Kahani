// Cosine similarity calculation
export function cosinesim(a, b) {
  const dotProduct = dot(a, b);
  const normA = norm(a);
  const normB = norm(b);
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

function dot(a, b) {
  const aMap = new Map(a.map(item => [item.mediaId, item.value]));
  const bMap = new Map(b.map(item => [item.mediaId, item.value]));
  
  let product = 0;
  for (const [mediaId, aValue] of aMap) {
    if (bMap.has(mediaId)) {
      product += aValue * bMap.get(mediaId);
    }
  }
  return product;
}

function norm(vector) {
  return Math.sqrt(
    vector.reduce((sum, item) => sum + Math.pow(item.value, 2), 0)
  );
}