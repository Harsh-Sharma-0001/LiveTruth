// mlService.js
import Claim from '../models/Claim.js';
import { canonicalizeClaim, isPersonalClaim } from './claimCanonicalizer.js';
import { getFullEvidenceForCanonical } from './wikipediaService.js';
import { isGeminiConfigured, performNLI } from './geminiService.js';
import { nliCache } from './cacheService.js';
import { searchGoogle } from './googleSearchService.js';

/**
 * Split transcript into independent factual statements
 */
export function detectClaims(transcript) {
  if (!transcript || !transcript.trim()) return [];

  // Step 1: Split by punctuation
  let sentences = transcript
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  // Step 2: Further split by "and" (treat as separator between independent statements)
  const allStatements = [];
  sentences.forEach(sentence => {
    const parts = sentence.split(/\s+and\s+/i);
    if (parts.length > 1) {
      // Each part after "and" is a separate statement
      parts.forEach(part => {
        const trimmed = part.trim().replace(/^[,\s]+|[,\s]+$/g, '');
        if (trimmed.length > 0) {
          allStatements.push(trimmed);
        }
      });
    } else {
      // No "and" found, use sentence as-is
      const cleaned = sentence.trim().replace(/\s+and\s*$/i, '').trim();
      if (cleaned.length > 0) {
        allStatements.push(cleaned);
      }
    }
  });

  return allStatements
    .filter(s => !s.endsWith('?')) // skip questions
    .filter(s => !/^(hi|hello|thanks|thank you)$/i.test(s))
    .map(text => ({ text }));
}

/**
 * CORE VERIFIER — SINGLE SOURCE OF TRUTH
 */
export async function verifyClaim(claimText) {
  try {
    // STEP 1 — Canonicalize
    const canonical = canonicalizeClaim(claimText);

    // STEP 2 — Personal claim gate
    if (isPersonalClaim(claimText)) {
      return {
        verdict: 'mixed',
        confidence: 50,
        sources: [],
        explanation: 'Personal or subjective claim. Cannot be publicly verified.'
      };
    }

    // STEP 2.5 — Check Cache
    const cachedResult = nliCache.get(canonical.text || claimText);
    if (cachedResult) {
      console.log(`✨ [Cache] Hit for claim: "${claimText}"`);
      return cachedResult;
    }

    // STEP 3 — Evidence retrieval (Google Search -> Wikipedia)
    let evidenceList = [];

    // Strategy 1: Google Custom Search (High Accuracy)
    try {
      const googleResults = await searchGoogle(canonical?.text || claimText);
      if (googleResults && googleResults.items && googleResults.items.length > 0) {
        console.log(`✅ [Evidence] Used Google Search (${googleResults.items.length} results)`);
        evidenceList = googleResults.items.slice(0, 3).map(item => ({
          text: item.snippet,
          source: { title: item.title, url: item.link },
          confidence: 0.95
        }));
      }
    } catch (e) {
      console.log(`⚠️ [Evidence] Google detection failed: ${e.message}`);
    }

    // Strategy 2: Wikipedia (Backfill / Fallback)
    if (evidenceList.length === 0) {
        console.log(`🔍 [Evidence] Fallback to Wikipedia for: "${canonical?.subject || 'canonical'}"`);
        evidenceList = await getFullEvidenceForCanonical(canonical);
    }
    
    console.log(`\n🔎 [Evidence] Final evidence count: ${evidenceList?.length || 0}`);
    
    // Fallback 1: Try searching key entities from canonical
    if (!evidenceList || evidenceList.length === 0) {
      console.log('⚠️ [Evidence] No evidence from canonical - trying fallback search');
      const { searchWikipedia } = await import('./wikipediaService.js');
      
      // Try subject first
      if (canonical?.subject && canonical.subject.length > 2) {
        try {
          console.log(`🔍 [Evidence] Searching for subject: "${canonical.subject}"`);
          const subjectEvidence = await searchWikipedia(canonical.subject);
          if (subjectEvidence && subjectEvidence.snippet && subjectEvidence.snippet.length > 50) {
            console.log(`✅ [Evidence] Found evidence for subject (${subjectEvidence.snippet.length} chars)`);
            evidenceList = [{
              entity: canonical.subject,
              text: subjectEvidence.snippet,
              source: subjectEvidence
            }];
          }
        } catch (error) {
          console.log(`❌ [Evidence] Error searching subject:`, error.message);
          // Continue
        }
      }
      
      // Try object if still no evidence
      if ((!evidenceList || evidenceList.length === 0) && canonical?.object && canonical.object.length > 2) {
        try {
          console.log(`🔍 [Evidence] Searching for object: "${canonical.object}"`);
          const objectEvidence = await searchWikipedia(canonical.object);
          if (objectEvidence && objectEvidence.snippet && objectEvidence.snippet.length > 50) {
            console.log(`✅ [Evidence] Found evidence for object (${objectEvidence.snippet.length} chars)`);
            evidenceList = [{
              entity: canonical.object,
              text: objectEvidence.snippet,
              source: objectEvidence
            }];
          }
        } catch (error) {
          console.log(`❌ [Evidence] Error searching object:`, error.message);
          // Continue
        }
      }
    }

    // Fallback 2: Extract key terms and search
    if (!evidenceList || evidenceList.length === 0) {
      console.log('⚠️ [Evidence] Still no evidence - trying key terms extraction');
      const { searchWikipedia } = await import('./wikipediaService.js');
      
      // Extract important nouns/proper nouns from claim
      const words = claimText.split(/\s+/);
      const importantWords = words
        .filter(w => w.length > 3 && /^[A-Z]/.test(w)) // Capitalized words (likely proper nouns)
        .slice(0, 2);
      
      console.log(`🔍 [Evidence] Important words:`, importantWords);
      
      if (importantWords.length > 0) {
        for (const word of importantWords) {
          try {
            console.log(`🔍 [Evidence] Searching for word: "${word}"`);
            const wordEvidence = await searchWikipedia(word);
            if (wordEvidence && wordEvidence.snippet && wordEvidence.snippet.length > 50) {
              console.log(`✅ [Evidence] Found evidence for word (${wordEvidence.snippet.length} chars)`);
              evidenceList = [{
                entity: word,
                text: wordEvidence.snippet,
                source: wordEvidence
              }];
              break; // Use first successful result
            }
          } catch (error) {
            console.log(`❌ [Evidence] Error searching word:`, error.message);
            // Continue
          }
        }
      }
    }

    // Fallback 3: Search full claim text
    if (!evidenceList || evidenceList.length === 0) {
      console.log('⚠️ [Evidence] Still no evidence - trying full claim search');
      try {
        const { searchWikipedia } = await import('./wikipediaService.js');
        const fallbackEvidence = await searchWikipedia(claimText);
        if (fallbackEvidence && fallbackEvidence.snippet && fallbackEvidence.snippet.length > 50) {
          console.log(`✅ [Evidence] Found evidence for full claim (${fallbackEvidence.snippet.length} chars)`);
          evidenceList = [{
            entity: claimText,
            text: fallbackEvidence.snippet,
            source: fallbackEvidence
          }];
        }
      } catch (error) {
        console.log(`❌ [Evidence] Error searching full claim:`, error.message);
        // Continue with empty evidence
      }
    }

    if (!evidenceList || evidenceList.length === 0) {
      console.log('❌ [Evidence] No evidence found - returning MIXED');
      return {
        verdict: 'mixed',
        confidence: 50,
        sources: [],
        explanation: 'No authoritative evidence found.'
      };
    }

    console.log(`✅ [Evidence] Final evidence count: ${evidenceList.length}`);

    // STEP 4 — NLI
    let entailments = 0;
    let contradictions = 0;
    let neutrals = 0;

    const sources = [];

    console.log(`\n🔍 [NLI] Processing claim: "${claimText}"`);
    console.log(`📊 [NLI] Evidence count: ${evidenceList.length}`);
    console.log(`🔧 [NLI] Gemini configured: ${isGeminiConfigured()}`);

    for (const evidence of evidenceList) {
      if (!isGeminiConfigured()) {
        // If Gemini not configured, default to neutral
        console.log('⚠️ [NLI] Gemini not configured - skipping NLI');
        neutrals++;
        if (evidence.source) sources.push(evidence.source);
        continue;
      }

      if (!evidence.text || evidence.text.length < 20) {
        console.log(`⚠️ [NLI] Evidence too short (${evidence.text?.length || 0} chars) - skipping`);
        neutrals++;
        continue;
      }

      console.log(`\n📝 [NLI] Evidence: "${evidence.text.substring(0, 100)}..."`);

      const nli = await performNLI(
        claimText,
        evidence.text,
        canonical
      );

      console.log(`🤖 [NLI] Gemini response:`, nli);

      if (!nli) {
        console.log('❌ [NLI] Gemini returned null - counting as neutral');
        neutrals++;
        if (evidence.source) sources.push(evidence.source);
        continue;
      }

      if (nli.relationship === 'ENTAILMENT') {
        console.log('✅ [NLI] ENTAILMENT detected');
        entailments++;
      } else if (nli.relationship === 'CONTRADICTION') {
        console.log('❌ [NLI] CONTRADICTION detected');
        contradictions++;
      } else {
        console.log('➖ [NLI] NEUTRAL detected');
        neutrals++;
      }

      if (evidence.source) sources.push(evidence.source);
    }

    console.log(`\n📊 [NLI] Final counts - Entailments: ${entailments}, Contradictions: ${contradictions}, Neutrals: ${neutrals}`);

    // STEP 5 — Deterministic verdict logic (PURE NLI - NO FALLBACKS)
    let verdict = 'mixed';
    let confidence = 50;

    // Pure deterministic logic based ONLY on NLI results
    if (contradictions > 0) {
      // ≥1 contradiction → FALSE
      verdict = 'false';
      confidence = Math.min(90, 60 + contradictions * 10);
      console.log(`🔴 [VERDICT] FALSE (${contradictions} contradictions)`);
    } else if (entailments > 0) {
      // ≥1 entailment AND 0 contradictions → TRUE
      verdict = 'true';
      confidence = Math.min(95, 70 + entailments * 10);
      console.log(`🟢 [VERDICT] TRUE (${entailments} entailments)`);
    } else {
      // 0 contradictions AND 0 entailments → MIXED (insufficient info)
      verdict = 'mixed';
      confidence = 50;
      console.log(`🟡 [VERDICT] MIXED (Insufficient evidence)`);
    }

    const result = {
      verdict,
      confidence,
      sources,
      explanation: verdict === 'mixed' 
        ? 'This claim is MIXED or UNVERIFIED due to insufficient or inconclusive evidence.'
        : `Verified with ${entailments} entailments and ${contradictions} contradictions.`
    };

    // Cache the result
    nliCache.set(canonical.text || claimText, result);
    
    return result;

  } catch (err) {
    return {
      verdict: 'mixed',
      confidence: 50,
      sources: [],
      explanation: 'Verification error occurred.'
    };
  }
}

// checkObviousFacts() DELETED - Regex-based truth is forbidden
// All verdicts must come from NLI only

// inferFromEvidenceText() DELETED - Similarity-based truth is forbidden
// All verdicts must come from NLI only

/**
 * Explanation generator
 */
function buildExplanation(verdict, entailments, contradictions) {
  if (verdict === 'true') {
    return `This claim is TRUE. ${entailments} source(s) clearly support it with no contradictions.`;
  }
  if (verdict === 'false') {
    return `This claim is FALSE. ${contradictions} source(s) clearly contradict it.`;
  }
  return 'This claim is MIXED due to insufficient or inconclusive evidence.';
}

/**
 * Verify all claims from transcript
 */
export async function processTranscript(transcript) {
  const claims = detectClaims(transcript);
  const results = [];

  for (const claim of claims) {
    const verification = await verifyClaim(claim.text);

    const result = {
      claim: claim.text,
      verdict: verification.verdict,
      confidence: verification.confidence,
      sources: verification.sources,
      explanation: verification.explanation,
      timestamp: new Date()
    };

    // Save safely (non-blocking)
    try {
      await Claim.create(result);
    } catch {}

    results.push(result);
  }

  return results;
}
