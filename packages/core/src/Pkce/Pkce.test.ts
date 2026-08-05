// @vitest-environment node
// crypto.subtle.digest requires a spec-compliant SubtleCrypto implementation.
// The jsdom environment's crypto only provides getRandomValues/randomUUID.
// The node environment has a full WebCrypto implementation, matching the
// browser target for which this code is written.

import { describe, it, expect } from 'vitest';
import { generateCodeVerifier, generateCodeChallenge } from './Pkce';

// ---------------------------------------------------------------------------
// RFC 7636 Appendix B test vector
// verifier:   dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
// challenge:  E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
// (Same vector referenced in UrlHelper.test.ts)
// ---------------------------------------------------------------------------
const RFC_VERIFIER = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
const RFC_CHALLENGE = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

describe('Pkce', () => {
  describe('generateCodeVerifier', () => {
    it('returns a base64url string of 43 characters (32 bytes encoded)', () => {
      const verifier = generateCodeVerifier();
      expect(verifier).toHaveLength(43);
    });

    it('uses only base64url characters [A-Za-z0-9\\-_]', () => {
      const verifier = generateCodeVerifier();
      expect(verifier).toMatch(/^[A-Za-z0-9\-_]+$/);
    });

    it('contains no base64 padding characters', () => {
      const verifier = generateCodeVerifier();
      expect(verifier).not.toContain('=');
    });

    it('produces a different value on each call (collision-resistant)', () => {
      const a = generateCodeVerifier();
      const b = generateCodeVerifier();
      expect(a).not.toBe(b);
    });
  });

  describe('generateCodeChallenge', () => {
    it('matches the RFC 7636 Appendix B test vector', async () => {
      const challenge = await generateCodeChallenge(RFC_VERIFIER);
      expect(challenge).toBe(RFC_CHALLENGE);
    });

    it('returns a base64url string with no padding', async () => {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      expect(challenge).toMatch(/^[A-Za-z0-9\-_]+$/);
      expect(challenge).not.toContain('=');
    });

    it('returns a 43-character string (SHA-256 → 32 bytes → base64url)', async () => {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      expect(challenge).toHaveLength(43);
    });

    it('produces the same challenge for the same verifier (deterministic)', async () => {
      const verifier = generateCodeVerifier();
      const a = await generateCodeChallenge(verifier);
      const b = await generateCodeChallenge(verifier);
      expect(a).toBe(b);
    });

    it('produces different challenges for different verifiers', async () => {
      const a = await generateCodeChallenge(generateCodeVerifier());
      const b = await generateCodeChallenge(generateCodeVerifier());
      expect(a).not.toBe(b);
    });
  });
});
