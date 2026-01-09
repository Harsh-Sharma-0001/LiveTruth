import natural from 'natural';

const { TfIdf } = natural;
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

/**
 * Calculate semantic similarity between claim and evidence
 * Uses TF-IDF cosine similarity
 */
export function calculateSemanticSimilarity(claimText, evidenceText) {
  if (!claimText || !evidenceText) return 0;
  
  // Tokenize and stem both texts
  const claimTokens = tokenizer.tokenize(claimText.toLowerCase());
  const evidenceTokens = tokenizer.tokenize(evidenceText.toLowerCase());
  
  if (!claimTokens || !evidenceTokens || claimTokens.length === 0 || evidenceTokens.length === 0) {
    return 0;
  }
  
  // Stem tokens
  const claimStemmed = claimTokens.map(t => stemmer.stem(t));
  const evidenceStemmed = evidenceTokens.map(t => stemmer.stem(t));
  
  // Create TF-IDF vectors
  const tfidf = new TfIdf();
  tfidf.addDocument(claimStemmed);
  tfidf.addDocument(evidenceStemmed);
  
  // Get TF-IDF scores
  const claimVector = [];
  const evidenceVector = [];
  const allTerms = [...new Set([...claimStemmed, ...evidenceStemmed])];
  
  allTerms.forEach(term => {
    const claimScore = tfidf.tfidf(term, 0);
    const evidenceScore = tfidf.tfidf(term, 1);
    claimVector.push(claimScore);
    evidenceVector.push(evidenceScore);
  });
  
  // Calculate cosine similarity
  return cosineSimilarity(claimVector, evidenceVector);
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Check for entailment (claim is supported by evidence)
 */
export function checkEntailment(claimText, evidenceText) {
  const similarity = calculateSemanticSimilarity(claimText, evidenceText);
  
  // High similarity suggests entailment
  if (similarity > 0.6) {
    return {
      relationship: 'ENTAILMENT',
      confidence: similarity,
      score: similarity
    };
  }
  
  // Check for contradiction keywords
  const contradictionKeywords = [
    'not', 'never', 'incorrect', 'wrong', 'false', 'debunked',
    'disproven', 'contradicts', 'disagrees', 'different'
  ];
  
  const evidenceLower = evidenceText.toLowerCase();
  const hasContradiction = contradictionKeywords.some(keyword => 
    evidenceLower.includes(keyword) && evidenceLower.includes(claimText.toLowerCase().split(' ')[0])
  );
  
  if (hasContradiction && similarity < 0.3) {
    return {
      relationship: 'CONTRADICTION',
      confidence: 1 - similarity,
      score: similarity
    };
  }
  
  return {
    relationship: 'NEUTRAL',
    confidence: 0.5,
    score: similarity
  };
}
