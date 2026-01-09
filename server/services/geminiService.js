import axios from 'axios';

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured() {
  return GEMINI_API_KEY && 
         GEMINI_API_KEY !== 'your_gemini_api_key_here' && 
         GEMINI_API_KEY.length > 10;
}

/**
 * Verify a claim using Gemini AI - FAST and ACCURATE
 * Gemini has access to vast knowledge and can quickly verify facts
 */
export async function verifyClaimWithGemini(claimText) {
  if (!isGeminiConfigured()) {
    return null; // Fall back to other methods
  }
  
  try {
    const prompt = `You are a fact-checking AI. Analyze the following claim and determine if it is TRUE, FALSE, or MISLEADING.

CLAIM: "${claimText}"

Instructions:
1. Use your knowledge to verify this claim
2. Consider current facts (your knowledge includes information up to 2024)
3. Be precise - if the claim is factually correct, say TRUE. If incorrect, say FALSE. If partially correct or needs context, say MISLEADING.

IMPORTANT: You must respond in EXACTLY this JSON format:
{
  "verdict": "TRUE" or "FALSE" or "MISLEADING",
  "confidence": 85,
  "explanation": "Brief explanation of why this verdict was given",
  "source": "Source of information (e.g., 'General knowledge', 'Wikipedia', etc.)"
}

Respond ONLY with the JSON, no other text.`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1, // Low temperature for factual responses
          topK: 1,
          topP: 0.95,
          maxOutputTokens: 500
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    // Extract the text response
    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      console.log('⚠️ Empty Gemini response');
      return null;
    }

    // Parse JSON from response
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanedResponse = textResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const result = JSON.parse(cleanedResponse);
      
      // Normalize verdict
      let verdict = (result.verdict || '').toLowerCase();
      if (verdict === 'true') verdict = 'true';
      else if (verdict === 'false') verdict = 'false';
      else if (verdict === 'misleading' || verdict === 'mixed') verdict = 'misleading';
      else verdict = 'unverified';
      
      console.log(`🤖 Gemini verdict: ${verdict.toUpperCase()} (${result.confidence}%) - "${claimText.substring(0, 40)}..."`);
      
      return {
        verdict: verdict,
        confidence: result.confidence || 85,
        explanation: result.explanation || 'Verified by Gemini AI.',
        sources: [{
          title: result.source || 'Gemini AI Fact Check',
          url: 'https://gemini.google.com/',
          snippet: result.explanation || 'Fact checked using Google Gemini AI.'
        }]
      };
    } catch (parseError) {
      console.log('⚠️ Failed to parse Gemini response:', textResponse.substring(0, 100));
      return null;
    }
  } catch (error) {
    if (error.response) {
      console.error('❌ Gemini API Error:', error.response.status, error.response.data?.error?.message || error.message);
    } else {
      console.error('❌ Gemini API Error:', error.message);
    }
    return null;
  }
}

/**
 * Batch verify multiple claims using Gemini - More efficient
 */
export async function verifyMultipleClaimsWithGemini(claims) {
  if (!isGeminiConfigured() || claims.length === 0) {
    return null;
  }
  
  try {
    const claimsList = claims.map((c, i) => `${i + 1}. "${c.text || c}"`).join('\n');
    
    const prompt = `You are a fact-checking AI. Analyze the following claims and determine if each is TRUE, FALSE, or MISLEADING.

CLAIMS:
${claimsList}

Instructions:
1. Use your knowledge to verify each claim
2. Consider current facts (your knowledge includes information up to 2024)
3. Be precise and accurate

IMPORTANT: Respond in EXACTLY this JSON format (array of results):
[
  {
    "claim_number": 1,
    "verdict": "TRUE" or "FALSE" or "MISLEADING",
    "confidence": 85,
    "explanation": "Brief explanation"
  }
]

Respond ONLY with the JSON array, no other text.`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.95,
          maxOutputTokens: 2000
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      return null;
    }

    try {
      let cleanedResponse = textResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const results = JSON.parse(cleanedResponse);
      
      return results.map(result => ({
        verdict: (result.verdict || '').toLowerCase() === 'true' ? 'true' : 
                 (result.verdict || '').toLowerCase() === 'false' ? 'false' : 
                 (result.verdict || '').toLowerCase() === 'misleading' ? 'misleading' : 'unverified',
        confidence: result.confidence || 85,
        explanation: result.explanation || 'Verified by Gemini AI.',
        sources: [{
          title: 'Gemini AI Fact Check',
          url: 'https://gemini.google.com/',
          snippet: result.explanation || 'Fact checked using Google Gemini AI.'
        }]
      }));
    } catch (parseError) {
      console.log('⚠️ Failed to parse batch Gemini response');
      return null;
    }
  } catch (error) {
    console.error('❌ Gemini batch API Error:', error.message);
    return null;
  }
}
