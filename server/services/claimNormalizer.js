import nlp from 'compromise';

/**
 * Normalize a claim into structured format
 * Extracts: subject, predicate, value
 */
export function normalizeClaim(claimText) {
  const doc = nlp(claimText);
  
  // Extract entities
  const people = doc.people().out('array');
  const places = doc.places().out('array');
  const organizations = doc.organizations().out('array');
  
  // Extract numbers
  const numbers = claimText.match(/\d+(?:\.\d+)?/g) || [];
  
  // Extract dates/years
  const years = claimText.match(/\b(19|20)\d{2}\b/g) || [];
  
  // Extract main subject (first noun phrase or entity)
  let subject = '';
  const nouns = doc.nouns().out('array');
  if (people.length > 0) {
    subject = people[0];
  } else if (organizations.length > 0) {
    subject = organizations[0];
  } else if (places.length > 0) {
    subject = places[0];
  } else if (nouns.length > 0) {
    subject = nouns[0];
  }
  
  // Extract predicate (main verb or assertion)
  const verbs = doc.verbs().out('array');
  const predicate = verbs.length > 0 ? verbs[0] : '';
  
  // Extract value (number, date, or descriptive phrase)
  let value = '';
  if (numbers.length > 0) {
    value = numbers[0];
  } else if (years.length > 0) {
    value = years[0];
  } else {
    // Try to extract descriptive value
    const adjectives = doc.adjectives().out('array');
    if (adjectives.length > 0) {
      value = adjectives.join(' ');
    }
  }
  
  // Build normalized query for search
  const searchTerms = [];
  if (subject) searchTerms.push(subject);
  if (predicate) searchTerms.push(predicate);
  if (value) searchTerms.push(value);
  
  return {
    original: claimText,
    subject: subject || claimText.split(' ').slice(0, 3).join(' '),
    predicate: predicate || 'is',
    value: value || '',
    entities: {
      people,
      places,
      organizations,
      numbers,
      years
    },
    searchQuery: searchTerms.join(' ') || claimText,
    normalized: `${subject} ${predicate} ${value}`.trim()
  };
}
