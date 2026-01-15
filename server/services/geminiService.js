// geminiService.js
import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export function isGeminiConfigured() {
  // Read from process.env at runtime (not at module load time)
  const apiKey = process.env.GEMINI_API_KEY;
  
  const isConfigured = Boolean(
    apiKey && 
    apiKey.length > 10 &&
    apiKey !== 'your_gemini_api_key_here' &&
    !apiKey.startsWith('your_')
  );
  
  console.log(`🔧 [Gemini] isGeminiConfigured check:`, {
    hasKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'none',
    isConfigured
  });
  
  return isConfigured;
}

/**
 * Gemini NLI — ENTAILMENT / CONTRADICTION / NEUTRAL ONLY
 */
export async function performNLI(claimText, evidenceText, canonicalClaim) {
  if (!isGeminiConfigured()) return null;

  // Read API key at runtime
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  const today = new Date().toISOString().split('T')[0];
  const timeContext = canonicalClaim?.time || 'present';

  const prompt = `You are a Natural Language Inference (NLI) system. Your task is to determine if the EVIDENCE logically ENTAILS, CONTRADICTS, or is NEUTRAL to the CLAIM.

CRITICAL RULES:
1. ENTAILMENT: Use when evidence PROVES the claim is TRUE. Be decisive - if evidence confirms the claim, use ENTAILMENT.
   Examples:
   - Claim: "Tokyo is the capital of Japan"
   - Evidence: "Tokyo is the capital and largest city of Japan"
   - Answer: ENTAILMENT (evidence directly confirms the claim)

2. CONTRADICTION: Use when evidence PROVES the claim is FALSE. Be decisive - if evidence contradicts the claim, use CONTRADICTION.
   Examples:
   - Claim: "Antarctica is on North Pole"
   - Evidence: "Antarctica is located at the South Pole"
   - Answer: CONTRADICTION (evidence directly contradicts the claim)

3. NEUTRAL: Use ONLY when evidence is completely unrelated or provides no information about the claim.
   Do NOT use NEUTRAL if evidence is related but you're uncertain - be decisive based on what the evidence says.

Current date: ${today}
Time context: ${timeContext}

CLAIM: "${claimText}"

EVIDENCE: "${evidenceText}"

Analyze: Does the evidence prove the claim TRUE (ENTAILMENT), prove it FALSE (CONTRADICTION), or provide no relevant information (NEUTRAL)?

Respond ONLY with valid JSON:
{
  "relationship": "ENTAILMENT" | "CONTRADICTION" | "NEUTRAL",
  "confidence": 0.0-1.0
}`;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.0,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 200
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      },
      { timeout: 10000 }
    );

    const raw =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!raw) return null;

    let cleaned = raw.replace(/```json|```/g, '').trim();
    
    // Try to extract JSON if wrapped in other text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }
    
    const parsed = JSON.parse(cleaned);

    let relationship = (parsed.relationship || '').toUpperCase().trim();
    
    // Normalize relationship values
    if (relationship.includes('ENTAIL') || relationship === 'TRUE' || relationship === 'SUPPORT') {
      relationship = 'ENTAILMENT';
    } else if (relationship.includes('CONTRADICT') || relationship === 'FALSE' || relationship === 'DISPROVE') {
      relationship = 'CONTRADICTION';
    } else if (relationship.includes('NEUTRAL') || relationship === 'UNKNOWN' || relationship === 'UNCLEAR') {
      relationship = 'NEUTRAL';
    }
    
    if (!['ENTAILMENT', 'CONTRADICTION', 'NEUTRAL'].includes(relationship)) {
      return null;
    }

    return {
      relationship,
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5))
    };
  } catch (error) {
    // Log error for debugging
    console.error('❌ [Gemini] NLI Error:', error.message);
    if (error.response) {
      console.error('❌ [Gemini] Response status:', error.response.status);
      console.error('❌ [Gemini] Response data:', JSON.stringify(error.response.data).substring(0, 200));
    }
    return null;
  }
}
