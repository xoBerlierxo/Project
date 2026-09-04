// Basic defense-in-depth: strips script/style tags and angle brackets from
// free-text fields before storage. The frontend is still responsible for
// escaping output correctly.
function sanitizeText(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+>/g, '')
    .trim();
}

module.exports = { sanitizeText };
