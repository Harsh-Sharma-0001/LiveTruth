import axios from 'axios';

// Use Flash-Lite for higher speed and rate limits
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';
let rateLimitUntil = 0;

export function isRateLimited() {
  return rateLimitUntil > Date.now();
}

export function isGeminiConfigured() {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = Boolean(
    apiKey && 
    apiKey.length > 10 &&
    apiKey !== 'your_gemini_api_key_here' &&
    !apiKey.startsWith('your_')
  );
  return isConfigured;
}

/**
 * BATCH NLI: Analyzes ALL evidence in ONE API call.
 * This is the critical fix for Rate Limits (429) and Accuracy.
 */
export async function performNLI_Batch(claimText, evidenceList, canonicalClaim) {
  if (isRateLimited()) return { rateLimited: true };
  if (!isGeminiConfigured()) return null;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const today = new Date().toISOString().split('T')[0];
  const timeContext = canonicalClaim?.time || 'present';

  // Format the evidence list into a clear text block for the AI
  const evidenceString = evidenceList
    .map((e, i) => `Source ${i + 1}: "${e.text}" (URL: ${e.source?.url || 'N/A'})`)
    .join('\n\n');

  const prompt = `
  You are an expert Fact Checker. Your task is to verify a CLAIM against a list of RETRIEVED EVIDENCE.

  CLAIM: "${claimText}"

  RETRIEVED EVIDENCE:
  ${evidenceString}

  CONTEXT: 
  - Today's Date: ${today}
  - Time Context: ${timeContext}

  INSTRUCTIONS:
  1. Analyze the evidence. Does it support (ENTAIL) or contradict the claim?
  2. If sources contradict each other, trust the most recent or authoritative one (e.g. government/official sites).
  3. If the claim is about a current official (e.g. "President of USA"), check the date. If today is 2026, Biden/Trump/etc status might have changed.
  4. IGNORE irrelevant evidence.

  OUTPUT FORMAT (JSON ONLY):
  {
    "verdict": "TRUE" | "FALSE" | "MIXED",
    "confidence": 0-100,
    "explanation": "One short sentence explaining the verdict based on the sources."
  }
  `;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1, // Low temp for strict logic
          responseMimeType: "application/json" // Force strict JSON output
        }
      },
      { timeout: 15000 }
    );

    const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!raw) return null;

    // Clean up Markdown if present (Gemini sometimes adds ```json ... ```)
    let cleanJson = raw.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(json)?|```$/g, '').trim();
    }

    const parsed = JSON.parse(cleanJson);

    return {
      verdict: parsed.verdict.toLowerCase(), // 'true', 'false', 'mixed'
      confidence: parsed.confidence,
      explanation: parsed.explanation
    };

  } catch (error) {
    // Handle Rate Limits
    if (error.response && error.response.status === 429) {
      console.error('❌ [Gemini] Rate Limit Exceeded (429). Pausing NLI requests for 60s.');
      rateLimitUntil = Date.now() + 60000;
      return { rateLimited: true };
    }

    console.error('❌ [Gemini] Batch NLI Error:', error.message);
    return null;
  }
}

/**
 * Rewrite claim using context (Coreference Resolution)
 */
export async function rewriteClaim(claimText, context = []) {
  if (!isGeminiConfigured() || !context || context.length === 0) return claimText;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const prompt = `Rewrite the LAST_CLAIM to be standalone by replacing pronouns (he, she, it) with entities from CONTEXT.\n\nCONTEXT:\n${context.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nLAST_CLAIM: "${claimText}"\n\nOUTPUT: Rewritten claim only.`;

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 100 }
      },
      { timeout: 5000 }
    );
    const rewritten = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return rewritten ? rewritten.trim().replace(/^"|"$/g, '') : claimText;
  } catch (error) {
    return claimText;
  }
}