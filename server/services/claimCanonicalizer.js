/**
 * Atomic Claim Canonicalization
 * Converts claims into structured (subject, relation, object, time) format
 */

/**
 * Canonicalize a claim into atomic form
 * @param {string} claimText - The original claim text
 * @returns {Object} Canonical form: { subject, relation, object, time }
 */
export function canonicalizeClaim(claimText) {
  if (!claimText || claimText.trim().length === 0) {
    return null;
  }

  const claim = claimText.trim();
  const claimLower = claim.toLowerCase();

  // Detect time from verb tense
  let time = 'present'; // default
  if (/\b(was|were|had|did)\b/i.test(claim)) {
    time = 'past';
  } else if (/\b(will|would|shall|should)\b/i.test(claim)) {
    time = 'future';
  } else if (/\b(is|are|am)\b/i.test(claim)) {
    time = 'present';
  } else if (/\b(always|never|ever|timeless|eternal)\b/i.test(claim)) {
    time = 'timeless';
  }

  // Extract subject, relation, object using common patterns
  
  // Pattern 1: "X is the Y of Z" (e.g., "Narendra Modi is the Prime Minister of India")
  // More specific pattern to catch "is the [role] of [country]"
  let match = claim.match(/^(.+?)\s+(is|are|was|were|am)\s+the\s+(.+?)\s+of\s+(.+)$/i);
  if (match) {
    const subject = match[1].trim();
    const relation = match[3].trim();
    const object = match[4].trim();
    
    // Clean up common prefixes
    const cleanSubject = subject.replace(/^(the|a|an)\s+/i, '').trim();
    const cleanObject = object.replace(/^(the|a|an)\s+/i, '').trim();
    
    return {
      subject: cleanSubject,
      relation: relation,
      object: cleanObject,
      time: time
    };
  }

  // Pattern 1b: "X is Y of Z" (without "the") - e.g., "Tokyo is capital of Japan"
  match = claim.match(/^(.+?)\s+(is|are|was|were|am)\s+(.+?)\s+of\s+(.+)$/i);
  if (match) {
    const subject = match[1].trim();
    const relation = match[3].trim();
    const object = match[4].trim();
    
    // Clean up common prefixes
    const cleanSubject = subject.replace(/^(the|a|an)\s+/i, '').trim();
    const cleanObject = object.replace(/^(the|a|an)\s+/i, '').trim();
    
    return {
      subject: cleanSubject,
      relation: relation,
      object: cleanObject,
      time: time
    };
  }

  // Pattern 1c: "X is Y" (e.g., "Tokyo is capital" - but we need object)
  match = claim.match(/^(.+?)\s+(is|are|was|were|am)\s+(?:the\s+)?(.+?)$/i);
  if (match) {
    const subject = match[1].trim();
    const relation = match[3].trim();
    
    // Check if relation contains "of" - split it
    const ofMatch = relation.match(/^(.+?)\s+of\s+(.+)$/i);
    if (ofMatch) {
      return {
        subject: subject,
        relation: ofMatch[1].trim(),
        object: ofMatch[2].trim(),
        time: time
      };
    }
    
    // If no "of", relation might be the object (e.g., "Jupiter is a planet")
    return {
      subject: subject,
      relation: 'is',
      object: relation,
      time: time
    };
  }

  // Pattern 2: "X revolves around Y" or "X orbits Y"
  match = claim.match(/^(.+?)\s+(revolves\s+around|orbits|revolves)\s+(.+)$/i);
  if (match) {
    return {
      subject: match[1].trim(),
      relation: 'orbits',
      object: match[3].trim(),
      time: 'timeless'
    };
  }

  // Pattern 3: "X is in Y" or "X is located in Y"
  match = claim.match(/^(.+?)\s+(?:is\s+)?(?:located\s+in|in|at)\s+(.+)$/i);
  if (match) {
    return {
      subject: match[1].trim(),
      relation: 'located_in',
      object: match[2].trim(),
      time: time
    };
  }

  // Pattern 4: "X is the Y" (e.g., "X is the capital")
  match = claim.match(/^(.+?)\s+is\s+the\s+(.+)$/i);
  if (match) {
    return {
      subject: match[1].trim(),
      relation: 'is',
      object: match[2].trim(),
      time: time
    };
  }

  // Fallback: Try to extract entities and guess structure
  // This is a simple fallback - in production, use NLP library
  const words = claim.split(/\s+/);
  if (words.length >= 3) {
    return {
      subject: words[0],
      relation: words.slice(1, -1).join(' '),
      object: words[words.length - 1],
      time: time
    };
  }

  // If all else fails, return basic structure
  return {
    subject: claim,
    relation: 'unknown',
    object: null,
    time: time
  };
}

/**
 * Check if a claim is personal/subjective (first person, opinions, etc.)
 * @param {string} claimText - The claim text
 * @returns {boolean} True if claim is personal
 */
export function isPersonalClaim(claimText) {
  if (!claimText) return false;
  
  const claimLower = claimText.toLowerCase();
  
  // First person indicators
  const firstPersonPatterns = [
    /^i\s+(am|think|believe|feel|know|say|claim|assert)/i,
    /^my\s+/i,
    /^i'm\s+/i,
    /^i've\s+/i,
    /\b(i am|i think|i believe|i feel|i know|i say|i claim|i assert)\b/i
  ];
  
  if (firstPersonPatterns.some(pattern => pattern.test(claimText))) {
    return true;
  }
  
  // Opinion indicators
  const opinionPatterns = [
    /\b(in my opinion|i think|i believe|i feel|i guess|i suppose)\b/i,
    /\b(beautiful|ugly|good|bad|nice|terrible)\b/i // Subjective adjectives (context-dependent)
  ];
  
  // Check for personal relationships
  const personalRelationshipPatterns = [
    /\b(my friend|my family|my colleague|my boss|my teacher)\b/i,
    /\b(rajar|rajar is my|i know rajar|rajar knows me)\b/i
  ];
  
  if (personalRelationshipPatterns.some(pattern => pattern.test(claimText))) {
    return true;
  }
  
  return false;
}

/**
 * Format canonical claim for display
 * @param {Object} canonical - Canonical claim object
 * @returns {string} Formatted string
 */
export function formatCanonical(canonical) {
  if (!canonical) return '';
  
  const { subject, relation, object, time } = canonical;
  if (object) {
    return `(${subject}, ${relation}, ${object}, ${time})`;
  }
  return `(${subject}, ${relation}, ${time})`;
}
