/**
 * Count occurrences of "AI" in text, including common misheard variations.
 *
 * @param {string} text - The text to search
 * @param {boolean} lenient - If true, count any sound that could be "AI" (for speed game)
 * @returns {number} Number of "AI" occurrences
 */
export function countAI(text, lenient = false) {
  if (!text || typeof text !== 'string') {
    return 0;
  }

  let count = 0;
  const countedPositions = new Set();

  // Strict patterns for lecture mode
  const strictPatterns = [
    /\bai\b/gi,
    /\ba\.i\.?\b/gi,
    /\ba\s+i\b/gi,
    /\bay\s*i\b/gi,
    /\bey\s*i\b/gi,
  ];

  // Super lenient patterns for speed game - count anything that sounds like "AI"
  const lenientPatterns = [
    /\bai\b/gi,                    // "AI"
    /\ba\.i\.?\b/gi,               // "A.I."
    /\bi\b/gi,                     // Just "I"
    /\beye\b/gi,                   // "eye"
    /\bay\b/gi,                    // "ay"
    /\baye\b/gi,                   // "aye"
    /\bhigh\b/gi,                  // "high" (sounds like AI)
    /\bhi\b/gi,                    // "hi"
    /\bye\b/gi,                    // "ye"
    /\ba\b/gi,                     // Just "a"
    /\bah\b/gi,                    // "ah"
    /\buh\b/gi,                    // "uh"
    /\beh\b/gi,                    // "eh"
    /\boh\b/gi,                    // "oh"
    /\bie\b/gi,                    // "ie"
    /\by\b/gi,                     // "y"
    /ai/gi,                        // "ai" anywhere (like in "said")
    /aye/gi,                       // "aye" anywhere
    /eye/gi,                       // "eye" anywhere
  ];

  const patterns = lenient ? lenientPatterns : strictPatterns;

  for (const pattern of patterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);

    while ((match = regex.exec(text)) !== null) {
      const pos = match.index;
      let alreadyCounted = false;

      for (let i = pos; i < pos + match[0].length; i++) {
        if (countedPositions.has(i)) {
          alreadyCounted = true;
          break;
        }
      }

      if (!alreadyCounted) {
        count++;
        for (let i = pos; i < pos + match[0].length; i++) {
          countedPositions.add(i);
        }
      }
    }
  }

  return count;
}

/**
 * Highlight "AI" occurrences in text by wrapping them in a marker.
 * Returns an array of text segments for rendering.
 *
 * @param {string} text - The text to process
 * @returns {Array<{text: string, isAI: boolean}>} Array of text segments
 */
export function highlightAI(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Combined pattern for all AI variations
  const pattern = /\b(ai|a\.i\.?|a\s+i|ay\s*i|ey\s*i|a\s*eye)\b/gi;

  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isAI: false,
      });
    }

    // Add the "AI" match
    segments.push({
      text: match[0],
      isAI: true,
    });

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isAI: false,
    });
  }

  return segments;
}
