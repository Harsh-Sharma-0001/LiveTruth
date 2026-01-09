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
      
      // Get the page extract/summary
      const extractResponse = await axios.get(searchUrl, {
        params: {
          action: 'query',
          titles: pageTitle,
          prop: 'extracts|info',
          exintro: true,
          explaintext: true,
          exsentences: 3,
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
 * Get Wikipedia page summary directly by title
 */
export async function getWikipediaPageSummary(title) {
  try {
    const cleanTitle = title.replace(/[^\w\s]/g, ' ').trim().replace(/ /g, '_');
    
    const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanTitle)}`, {
      timeout: 5000,
      headers: {
        'User-Agent': 'LiveTruth-FactChecker/1.0 (Educational Project)'
      }
    });

    if (response.data) {
      return {
        title: response.data.title || title,
        url: response.data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${cleanTitle}`,
        snippet: response.data.extract || response.data.description || '',
        source: 'Wikipedia'
      };
    }
    
    return null;
  } catch (error) {
    return null;
  }
}
