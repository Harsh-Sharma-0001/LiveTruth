import axios from 'axios';

/**
 * Search Wikipedia using MediaWiki API (more reliable than REST API)
 */
export async function searchWikipedia(query) {
  try {
    // Clean query
    const cleanQuery = query.replace(/[^\w\s]/g, ' ').trim();
    
    if (!cleanQuery || cleanQuery.length < 2) {
      return null;
    }
    
    // Use MediaWiki API for searching - more reliable
    const searchUrl = 'https://en.wikipedia.org/w/api.php';
    
    const response = await axios.get(searchUrl, {
      params: {
        action: 'query',
        list: 'search',
        srsearch: cleanQuery,
        srlimit: 1,
        format: 'json',
        origin: '*'
      },
      timeout: 5000,
      headers: {
        'User-Agent': 'LiveTruth-FactChecker/1.0 (Educational Project)'
      }
    });

    if (response.data?.query?.search && response.data.query.search.length > 0) {
      const result = response.data.query.search[0];
      const pageTitle = result.title;
      
      // Get the page extract/summary - FULL PARAGRAPH (not just 3 sentences)
      const extractResponse = await axios.get(searchUrl, {
        params: {
          action: 'query',
          titles: pageTitle,
          prop: 'extracts|info',
          exintro: true,
          explaintext: true,
          exsentences: 10, // Increased from 3 to get full paragraph
          exsectionformat: 'plain',
          inprop: 'url',
          format: 'json',
          origin: '*'
        },
        timeout: 5000,
        headers: {
          'User-Agent': 'LiveTruth-FactChecker/1.0 (Educational Project)'
        }
      });
      
      const pages = extractResponse.data?.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        
        if (page && pageId !== '-1') {
          return {
            title: page.title || pageTitle,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`,
            snippet: page.extract || result.snippet?.replace(/<[^>]*>/g, '') || '',
            source: 'Wikipedia'
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    // Silently fail for 403/404
    if (error.response?.status === 403 || error.response?.status === 404) {
      return null;
    }
    return null;
  }
}

/**
 * Search Wikipedia for multiple related terms
 */
export async function searchWikipediaMultiple(terms) {
  const results = [];
  
  for (const term of terms.slice(0, 3)) {
    if (term && term.length > 2) {
      const result = await searchWikipedia(term);
      if (result && !results.find(r => r.url === result.url)) {
        results.push(result);
      }
    }
  }
  
  return results;
}

/**
 * Get Wikipedia page summary directly by title - FULL PARAGRAPH
 */
export async function getWikipediaPageSummary(title) {
  try {
    if (!title || title.trim().length < 2) return null;
    
    // First try direct lookup
    let cleanTitle = title.trim();
    
    // Use MediaWiki API for full extract instead of REST API summary
    const searchUrl = 'https://en.wikipedia.org/w/api.php';
    let response = await axios.get(searchUrl, {
      params: {
        action: 'query',
        titles: cleanTitle,
        prop: 'extracts|info',
        exintro: true,
        explaintext: true,
        exsentences: 10, // Full paragraph
        exsectionformat: 'plain',
        inprop: 'url',
        format: 'json',
        origin: '*'
      },
      timeout: 8000,
      headers: {
        'User-Agent': 'LiveTruth-FactChecker/1.0 (Educational Project)'
      }
    });

    let pages = response.data?.query?.pages;
    if (pages) {
      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];
      
      if (page && pageId !== '-1' && page.extract && page.extract.length > 50) {
        return {
          title: page.title || title,
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`,
          snippet: page.extract,
          source: 'Wikipedia'
        };
      }
    }
    
    // If direct lookup fails, try searching first
    const searchResult = await searchWikipedia(title);
    if (searchResult && searchResult.snippet && searchResult.snippet.length > 50) {
      return searchResult;
    }
    
    return null;
  } catch (error) {
    // Try search as fallback
    try {
      const searchResult = await searchWikipedia(title);
      if (searchResult && searchResult.snippet && searchResult.snippet.length > 50) {
        return searchResult;
      }
    } catch (searchError) {
      // Ignore
    }
    return null;
  }
}

/**
 * Get full Wikipedia paragraph for subject and object entities
 * Returns evidence text for NLI
 */
export async function getFullEvidenceForCanonical(canonical) {
  const evidence = [];
  
  if (!canonical) return evidence;
  
  const { subject, object, relation } = canonical;
  
  // Get evidence for subject
  if (subject && subject.length > 2) {
    try {
      const subjectEvidence = await getWikipediaPageSummary(subject);
      if (subjectEvidence && subjectEvidence.snippet && subjectEvidence.snippet.length > 50) {
        evidence.push({
          entity: subject,
          text: subjectEvidence.snippet,
          source: subjectEvidence
        });
      }
    } catch (error) {
      // Continue
    }
  }
  
  // Get evidence for object
  if (object && object.length > 2) {
    try {
      const objectEvidence = await getWikipediaPageSummary(object);
      if (objectEvidence && objectEvidence.snippet && objectEvidence.snippet.length > 50) {
        evidence.push({
          entity: object,
          text: objectEvidence.snippet,
          source: objectEvidence
        });
      }
    } catch (error) {
      // Continue
    }
  }
  
  // If we have a relation like "capital", also search for the relation + object
  // e.g., "capital of China" or "Prime Minister of India"
  if (relation && object && (relation.includes('capital') || relation.includes('Minister') || relation.includes('president'))) {
    try {
      const relationQuery = `${relation} of ${object}`;
      const relationEvidence = await searchWikipedia(relationQuery);
      if (relationEvidence && relationEvidence.snippet && relationEvidence.snippet.length > 50) {
        // Check if we already have this evidence
        if (!evidence.find(e => e.source?.url === relationEvidence.url)) {
          evidence.push({
            entity: relationQuery,
            text: relationEvidence.snippet,
            source: relationEvidence
          });
        }
      }
    } catch (error) {
      // Continue
    }
  }
  
  return evidence;
}
