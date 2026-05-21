/**
 * Content Filter for LearnSmart - Filters offensive/inappropriate content
 * This performs basic content filtering for student-safe environment
 */

const PROFANITY_PATTERNS = [
  /\b(damn|crap|hell|ass)\b/gi,
  // Add more patterns as needed
];

const CENSORSHIP_CHAR = "***";

/**
 * Filters profanity from text by replacing with censorship chars
 * @param {string} text - Text to filter
 * @returns {string} - Filtered text
 */
export function filterProfanity(text) {
  if (!text || typeof text !== "string") return text;
  
  let filtered = text;
  PROFANITY_PATTERNS.forEach((pattern) => {
    filtered = filtered.replace(pattern, CENSORSHIP_CHAR);
  });
  
  return filtered;
}

/**
 * Filters user input for basic inappropriate content
 * @param {string} content - User input content
 * @returns {object} - { isClean: boolean, filtered: string, reason?: string }
 */
export function filterUserContent(content) {
  if (!content || typeof content !== "string") {
    return { isClean: true, filtered: content };
  }

  // Check for extreme profanity (hard blocks)
  const harshWords = /\b(f[u\*]ck|sh[i\*]t)\b/gi;
  if (harshWords.test(content)) {
    return {
      isClean: false,
      filtered: content,
      reason: "Content contains inappropriate language",
    };
  }

  // Apply censorship
  const filtered = filterProfanity(content);

  return { isClean: true, filtered };
}

/**
 * Validates if content is appropriate for discussions
 * @param {string} content - Discussion post content
 * @returns {object} - { isValid: boolean, message?: string }
 */
export function validateDiscussionContent(content) {
  if (!content || typeof content !== "string") {
    return { isValid: false, message: "Content cannot be empty" };
  }

  if (content.length > 5000) {
    return { isValid: false, message: "Content too long (max 5000 characters)" };
  }

  // Check for spam patterns
  if (/(.)\1{9,}/.test(content)) {
    return { isValid: false, message: "Content appears to be spam" };
  }

  // Check filtered result
  const filtered = filterUserContent(content);
  if (!filtered.isClean) {
    return { isValid: false, message: filtered.reason };
  }

  return { isValid: true };
}
