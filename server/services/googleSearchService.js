import axios from "axios";

/**
 * Perform a Google Custom Search for the given query.
 * @param {string} query - The search query.
 * @returns {Promise<Object|null>} - The search response data or null on failure.
 */
export const searchGoogle = async (query) => {
  // Read keys at runtime to ensure latest env vars are used
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
    // Only log once or on debug to avoid spamming logs if keys are intentionally missing
    // console.warn("⚠️ [Google Search] API keys missing (GOOGLE_API_KEY / GOOGLE_SEARCH_ENGINE_ID)");
    return null;
  }

  try {
    console.log(`🔍 [Google Search] Querying: "${query}"`);
    const response = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: {
          key: GOOGLE_API_KEY,
          cx: SEARCH_ENGINE_ID,
          q: query,
        },
        timeout: 5000 // 5s timeout
      }
    );

    if (response.data && response.data.items) {
      console.log(`✅ [Google Search] Found ${response.data.items.length} results`);
    } else {
      console.log(`⚠️ [Google Search] No results found`);
    }

    return response.data;
  } catch (error) {
    console.error("❌ [Google Search] API Error:", error.message);
    if (error.response) {
      console.error("   Details:", error.response.data);
    }
    return null;
  }
};
