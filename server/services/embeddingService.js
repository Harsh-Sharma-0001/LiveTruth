
import { pipeline } from '@xenova/transformers';

// Singleton instance
let extractor = null;
let initializationFailed = false;

export async function getEmbedding(text) {
  if (!text || initializationFailed) return null;
  
  try {
    if (!extractor) {
      // Use small, fast model for CPU inference
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    
    // Generate embedding
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    
    // Convert Float32Array to regular array for MongoDB storage
    return Array.from(output.data);
  } catch (error) {
    if (!initializationFailed) {
      console.warn('⚠️ [Embedding] Initialization failed (likely network issue). Disabling embeddings for this session.');
      console.error('Detailed Error:', error.message);
      initializationFailed = true;
    }
    return null;
  }
}

// Cosine Similarity
export function calculateSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
