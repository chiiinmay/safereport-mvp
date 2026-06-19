const { customAlphabet } = require('nanoid');

// No ambiguous characters (0/O, 1/I) to keep IDs easy to write down/read aloud
const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const idPart = customAlphabet(alphabet, 8);
const tokenPart = customAlphabet(alphabet, 16);

function generateCaseId() {
  const year = new Date().getFullYear();
  return `SR-${year}-${idPart()}`;
}

function generateSecretToken() {
  return tokenPart(); // shown ONCE to the reporter, never stored in plaintext
}

module.exports = { generateCaseId, generateSecretToken };
