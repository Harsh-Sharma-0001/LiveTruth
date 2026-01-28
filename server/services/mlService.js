// mlService.js
import Claim from '../models/Claim.js';
import { canonicalizeClaim, isPersonalClaim } from './claimCanonicalizer.js';
import { getFullEvidenceForCanonical } from './wikipediaService.js';
// IMPORT CHANGE: We now import performNLI_Batch
import { isGeminiConfigured, performNLI_Batch } from './geminiService.js';
import { nliCache } from './cacheService.js';
import { searchGoogle } from './googleSearchService.js';

import nlp from 'compromise';

/**
 * Split transcript into independent factual statements
 */
export function detectClaims(transcript) {
  if (!transcript || !transcript.trim()) return [];

  // Use compromise for better NLP sentence detection
  let sentences = nlp(transcript).sentences().out('array');
  if (!sentences || sentences.length === 0) sentences = [transcript];

  const allStatements = [];
  sentences.forEach(sentence => {
    const cleanSent = sentence.trim();
    if (!cleanSent) return;

    const parts = cleanSent.split(/\s+and\s+/i);
    if (parts.length > 1) {
      parts.forEach(part => {
        const trimmed = part.trim().replace(/^[,\s]+|[,\s]+$/g, '');
        if (trimmed.length > 0) allStatements.push(trimmed);
      });
    } else {
      const cleaned = cleanSent.replace(/\s+and\s*$/i, '').trim();
      if (cleaned.length > 0) allStatements.push(cleaned);
    }
  });

  return allStatements
    .filter(s => !s.endsWith('?'))
    .filter(s => !/^(hi|hello|thanks|thank you)$/i.test(s))
    .map(text => ({ text }));
}

/**
 * CORE VERIFIER — SINGLE SOURCE OF TRUTH
 */
export async function verifyClaim(claimText, context = []) {
  try {
    // STEP 0 — Check for pronouns
    let effectiveClaim = claimText;
    const hasPronouns = /\b(he|she|it|they|this|that|him|her|them)\b/i.test(claimText);
    
    if (hasPronouns && context.length > 0) {
      console.log(`🧠 [Context] Detected pronouns in: "${claimText}". Using context...`);
      const { rewriteClaim } = await import('./geminiService.js');
      effectiveClaim = await rewriteClaim(claimText, context);
    }

    // STEP 1 — Canonicalize
    const canonical = canonicalizeClaim(effectiveClaim);

    // STEP 2 — Personal claim gate
    if (isPersonalClaim(effectiveClaim)) {
      return { verdict: 'mixed', confidence: 50, sources: [], explanation: 'Personal/subjective claim.' };
    }

    // STEP 2.5 — Check Cache
    const cachedResult = nliCache.get(canonical.text || effectiveClaim);
    if (cachedResult) {
      console.log(`✨ [Cache] In-Memory Hit: "${effectiveClaim}"`);
      return cachedResult;
    }

    // SEMANTIC CACHE CHECK (MongoDB)
    try {
      const { getEmbedding, calculateSimilarity } = await import('./embeddingService.js');
      const embedding = await getEmbedding(effectiveClaim);
      
      if (embedding) {
        // Exact Match
        const exactMatch = await Claim.findOne({ 
          claimHash: canonical.text || effectiveClaim, 
          verdict: { $ne: 'mixed' } 
        }).sort({ timestamp: -1 });

        if (exactMatch) {
          console.log(`✨ [Cache] DB Exact Hit: "${exactMatch.claim}"`);
          const result = {
            verdict: exactMatch.verdict,
            confidence: exactMatch.confidence,
            sources: exactMatch.sources,
            explanation: exactMatch.explanation
          };
          nliCache.set(canonical.text || effectiveClaim, result);
          return result;
        }

        // Semantic Match
        const recentClaims = await Claim.find({ 
          verdict: { $ne: 'mixed' },
          embedding: { $exists: true } 
        }).sort({ timestamp: -1 }).limit(50).select('claim embedding verdict confidence sources explanation');

        let bestMatch = null;
        let maxSim = 0;
        for (const prev of recentClaims) {
          if (!prev.embedding) continue;
          const sim = calculateSimilarity(embedding, prev.embedding);
          if (sim > maxSim) { maxSim = sim; bestMatch = prev; }
        }

        if (maxSim > 0.92) {
          console.log(`✨ [Cache] Semantic Hit (${(maxSim*100).toFixed(1)}%): "${bestMatch.claim}"`);
          const result = {
             verdict: bestMatch.verdict,
             confidence: bestMatch.confidence,
             sources: bestMatch.sources,
             explanation: bestMatch.explanation + ` (Matched with "${bestMatch.claim}")`
          };
          nliCache.set(canonical.text || effectiveClaim, result);
          return result;
        }
      }
    } catch (cacheErr) {
      // Silently fail semantic cache
    }

    // STEP 3 — Evidence Retrieval
    console.log(`🔍 [Evidence] Searching for: "${effectiveClaim}"`);
    
    const searchPromises = [
      searchGoogle(canonical?.text || effectiveClaim)
        .then(res => res?.items?.slice(0, 3).map(item => ({
             text: item.snippet,
             source: { title: item.title, url: item.link },
             confidence: 0.95
        })) || [])
        .catch(() => [])
    ];
    
    if (canonical) {
        searchPromises.push(getFullEvidenceForCanonical(canonical).catch(() => []));
    }
    
    const results = await Promise.all(searchPromises);
    let evidenceList = [...(results[0] || [])];
    const wikiEvidence = results[1] || [];
    
    for (const wikiItem of wikiEvidence) {
         if (evidenceList.length < 5) evidenceList.push(wikiItem);
    }

    // Fallback Searches (Keep your existing fallback logic here if evidenceList is empty)
    if (!evidenceList || evidenceList.length === 0) {
        // ... (Your existing fallback search logic goes here - Step 1, 2, 3 from original code) ...
        // For brevity, assuming you keep lines 205-288 from your original code here
        // If you need me to paste that back, let me know. 
        // I will include a simple fallback here for completeness:
         const { searchWikipedia } = await import('./wikipediaService.js');
         try {
            const fb = await searchWikipedia(effectiveClaim);
            if(fb?.snippet) evidenceList.push({ entity: effectiveClaim, text: fb.snippet, source: fb });
         } catch(e) {}
    }

    if (!evidenceList || evidenceList.length === 0) {
      console.log('❌ [Evidence] No evidence found - returning MIXED');
      return { verdict: 'mixed', confidence: 50, sources: [], explanation: 'No authoritative evidence found.' };
    }

    console.log(`✅ [Evidence] Final count: ${evidenceList.length}`);

    // STEP 4 — Exact Match Bypass
    const normalizedClaim = effectiveClaim.toLowerCase().replace(/[^\w\s]/g, '');
    for (const evidence of evidenceList) {
      if (!evidence.text) continue;
      const normalizedEvidence = evidence.text.toLowerCase().replace(/[^\w\s]/g, '');
      if (normalizedEvidence.includes(normalizedClaim) && normalizedClaim.length > 10) {
          console.log(`⚡ [Optimization] Exact Match found. Bypassing AI.`);
          const result = {
            verdict: 'true',
            confidence: 99,
            sources: evidenceList.map(e => e.source).filter(Boolean),
            explanation: `Exact match found in authoritative source: ${evidence.source?.title}`
          };
          nliCache.set(canonical.text || effectiveClaim, result);
          return result;
      }
    }

    // STEP 5 — BATCH NLI (The New Logic)
    console.log(`\n🔍 [NLI] Batch Processing ${evidenceList.length} evidence items...`);
    
    // Call the new batch function
    const aiResult = await performNLI_Batch(effectiveClaim, evidenceList, canonical);

    // Handle Failure / Rate Limits with Keyword Fallback
    if (!aiResult || aiResult.rateLimited) {
       console.log(`⚠️ [Fallback] AI Unavailable/RateLimited. Using Keyword Heuristic.`);
       
       const claimWords = effectiveClaim.toLowerCase().split(/\s+/).filter(w => w.length > 3);
       const sigWords = claimWords.filter(w => !['what','where','when','this','that','from','with'].includes(w));
       
       let maxScore = 0;
       for (const evidence of evidenceList) {
           if(!evidence.text) continue;
           const txt = evidence.text.toLowerCase();
           let matches = 0;
           sigWords.forEach(w => { if(txt.includes(w)) matches++; });
           const score = matches / sigWords.length;
           if(score > maxScore) maxScore = score;
       }
       
       console.log(`📊 [Fallback] Max Match Score: ${(maxScore*100).toFixed(1)}%`);

       if (maxScore >= 0.75) {
           return {
               verdict: 'true',
               confidence: 70,
               sources: evidenceList.map(e => e.source).filter(Boolean),
               explanation: 'Source Supported (Keyword Match). AI verification unavailable.'
           };
       } else {
           return {
               verdict: 'source_only',
               confidence: 0,
               sources: evidenceList.map(e => e.source).filter(Boolean),
               explanation: 'AI limit reached. Sources provided.'
           };
       }
    }

    // Success!
    console.log(`🤖 [AI VERDICT] ${aiResult.verdict.toUpperCase()} (${aiResult.confidence}%)`);
    
    const result = {
      verdict: aiResult.verdict,
      confidence: aiResult.confidence,
      sources: evidenceList.map(e => e.source).filter(Boolean),
      explanation: aiResult.explanation
    };

    nliCache.set(canonical.text || effectiveClaim, result);
    return result;

  } catch (err) {
    console.error('Verification Fatal Error:', err);
    return { verdict: 'mixed', confidence: 50, sources: [], explanation: 'Verification error occurred.' };
  }
}

export async function processTranscript(transcript, context = []) {
  const claims = detectClaims(transcript);
  const claimPromises = claims.map(async (claim) => {
    const verification = await verifyClaim(claim.text, context);
    const result = {
      claim: claim.text,
      ...verification,
      timestamp: new Date()
    };
    // Save to DB (Fire and forget)
    try {
      const { getEmbedding } = await import('./embeddingService.js');
      const embedding = await getEmbedding(result.claim);
      await Claim.create({ ...result, claimHash: claim.text, embedding });
    } catch {}
    return result;
  });
  return Promise.all(claimPromises);
}