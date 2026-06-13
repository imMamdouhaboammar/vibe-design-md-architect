export function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Fixed: handles \r\n, and supports multiple aliases for a section name
export function section(names) {
  const namesArray = Array.isArray(names) ? names : [names];
  const namesRegex = namesArray.map(escapeRegExp).join('|');
  // Use String.raw to avoid double escaping slashes in template literal
  return new RegExp(String.raw`(?:^|\r?\n)#{1,3}\s+.*(?:${namesRegex}).*(?:$|\r?\n)`, 'i');
}

export function any(terms) {
  return new RegExp(terms.map(escapeRegExp).join('|'), 'i');
}

export function has(doc, rx) {
  return rx.test(doc || '');
}

export function hasUnresolvedPlaceholders(doc) {
  if (!doc) return false;
  return /\[[^\]\n]{3,120}\]|\bTODO\b|\bTBD\b|\bplaceholder\b|\bcoming soon\b|\.\.\./i.test(doc);
}

/**
 * Creates a standard rule object.
 * 
 * Severity Policy:
 * - 'error': Issue can cause broken implementation, accessibility failure, or security risk.
 * - 'warning': Important missing guidance or high-risk pattern.
 * - 'info': Improvement suggestion.
 */
export function rule(id, title, category, severity, file, test, suggestedFix, repairability = 'suggested') {
  return { id, title, category, severity, file, test, explanation: title, suggestedFix, repairability };
}
