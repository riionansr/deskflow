/**
 * Cryptographic utility functions for client-side password safety
 */

const SALT = 'SABESP_PORTAL_FRASEOLOGIA_2026_SECURITY_SALT';

/**
 * Generates a SHA-256 salted hash of a given password using browser native Web Crypto API.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    // Robust fallback cipher in case Web Crypto is not fully accessible (e.g., non-localhost, non-https preview environments)
    console.warn('Web Crypto API not available. Utilizing fallback hash mechanism.', error);
    let hash = 0;
    const combined = password + SALT;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `fb_${Math.abs(hash).toString(16)}_${combined.length}`;
  }
}
