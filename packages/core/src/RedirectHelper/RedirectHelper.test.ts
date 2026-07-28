import { afterEach, describe, expect, it, vi } from 'vitest';
import { RedirectHelper } from './RedirectHelper';

describe('RedirectHelper', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('handlePreRedirect / handlePostRedirect (hosted backend mode)', () => {
    it('stores a redirect marker in localStorage', () => {
      const helper = new RedirectHelper();
      expect(localStorage.getItem('fa-sdk-redirect-value')).toBeNull();

      helper.handlePreRedirect();
      expect(localStorage.getItem('fa-sdk-redirect-value')).not.toBeNull();
    });

    it('invokes the callback with undefined when no state was provided', () => {
      const helper = new RedirectHelper();
      const callback = vi.fn();

      helper.handlePreRedirect();
      helper.handlePostRedirect(callback);

      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith(undefined);
    });

    it('invokes the callback with the stored state', () => {
      const helper = new RedirectHelper();
      const callback = vi.fn();

      helper.handlePreRedirect('my-state');
      helper.handlePostRedirect(callback);

      expect(callback).toHaveBeenCalledWith('my-state');
    });

    it('preserves state values that contain colons', () => {
      const helper = new RedirectHelper();
      const callback = vi.fn();
      const stateWithColons = 'return:/dashboard?tab=2';

      helper.handlePreRedirect(stateWithColons);
      helper.handlePostRedirect(callback);

      expect(callback).toHaveBeenCalledWith(stateWithColons);
    });

    it('removes the redirect marker from localStorage after post-redirect', () => {
      const helper = new RedirectHelper();

      helper.handlePreRedirect('some-state');
      expect(localStorage.getItem('fa-sdk-redirect-value')).not.toBeNull();

      helper.handlePostRedirect();
      expect(localStorage.getItem('fa-sdk-redirect-value')).toBeNull();
    });

    it('does not invoke callback when no redirect was initiated', () => {
      const helper = new RedirectHelper();
      const callback = vi.fn();

      helper.handlePostRedirect(callback);

      expect(callback).not.toHaveBeenCalled();
    });

    it('does not throw when no callback is provided to handlePostRedirect', () => {
      const helper = new RedirectHelper();
      helper.handlePreRedirect('state');
      expect(() => helper.handlePostRedirect()).not.toThrow();
    });
  });

  describe('handlePreRedirect with codeVerifier (DPoP mode)', () => {
    it('persists the code_verifier and returns it via getCodeVerifier()', () => {
      const helper = new RedirectHelper();
      const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

      helper.handlePreRedirect(undefined, verifier);

      expect(helper.getCodeVerifier()).toBe(verifier);
    });

    it('persists both code_verifier and state; both are retrievable', () => {
      const helper = new RedirectHelper();
      const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      const state = 'my-state';
      const callback = vi.fn();

      helper.handlePreRedirect(state, verifier);

      expect(helper.getCodeVerifier()).toBe(verifier);
      helper.handlePostRedirect(callback);
      expect(callback).toHaveBeenCalledWith(state);
    });

    it('preserves state with colons alongside a code_verifier', () => {
      const helper = new RedirectHelper();
      const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      const stateWithColons = 'return:/dashboard?tab=2';
      const callback = vi.fn();

      helper.handlePreRedirect(stateWithColons, verifier);

      expect(helper.getCodeVerifier()).toBe(verifier);
      helper.handlePostRedirect(callback);
      expect(callback).toHaveBeenCalledWith(stateWithColons);
    });

    it('returns undefined from getCodeVerifier() when no redirect was initiated', () => {
      const helper = new RedirectHelper();
      expect(helper.getCodeVerifier()).toBeUndefined();
    });

    it('returns undefined from getCodeVerifier() when no verifier was stored (hosted backend mode)', () => {
      const helper = new RedirectHelper();
      helper.handlePreRedirect('some-state');
      expect(helper.getCodeVerifier()).toBeUndefined();
    });

    it('getCodeVerifier() still works after a handlePostRedirect call clears storage', () => {
      const helper = new RedirectHelper();
      helper.handlePreRedirect('state', 'verifier-value');

      // Post-redirect removes the marker.
      helper.handlePostRedirect();

      // After cleanup, getCodeVerifier() should return undefined.
      expect(helper.getCodeVerifier()).toBeUndefined();
    });
  });

  describe('storage format', () => {
    it('hosted backend mode stores a plain, non-JSON string', () => {
      const helper = new RedirectHelper();
      helper.handlePreRedirect('some-state');

      const raw = localStorage.getItem('fa-sdk-redirect-value')!;
      expect(() => JSON.parse(raw)).toThrow();
      expect(raw).toMatch(/^[0-9a-f]+:some-state$/);
    });

    it('DPoP mode stores a JSON object with codeVerifier and state', () => {
      const helper = new RedirectHelper();
      helper.handlePreRedirect('some-state', 'some-verifier');

      const raw = localStorage.getItem('fa-sdk-redirect-value')!;
      const parsed = JSON.parse(raw);
      expect(parsed).toEqual({
        codeVerifier: 'some-verifier',
        state: 'some-state',
      });
    });

    it('a hosted backend mode call after a DPoP mode call is not confused with the old JSON value', () => {
      const helper = new RedirectHelper();
      const callback = vi.fn();

      helper.handlePreRedirect('dpop-state', 'dpop-verifier');
      helper.handlePreRedirect('hosted-backend-state'); // overwrites with the plain format

      expect(helper.getCodeVerifier()).toBeUndefined();
      helper.handlePostRedirect(callback);
      expect(callback).toHaveBeenCalledWith('hosted-backend-state');
    });

    it('a DPoP mode call after a hosted backend mode call is not confused with the old plain value', () => {
      const helper = new RedirectHelper();
      const callback = vi.fn();

      helper.handlePreRedirect('hosted-backend-state');
      helper.handlePreRedirect('dpop-state', 'dpop-verifier'); // overwrites with the JSON format

      expect(helper.getCodeVerifier()).toBe('dpop-verifier');
      helper.handlePostRedirect(callback);
      expect(callback).toHaveBeenCalledWith('dpop-state');
    });

    it('treats an empty-string codeVerifier as DPoP mode (JSON format), but getCodeVerifier() returns undefined for it', () => {
      const helper = new RedirectHelper();

      helper.handlePreRedirect('some-state', '');

      const raw = localStorage.getItem('fa-sdk-redirect-value')!;
      expect(() => JSON.parse(raw)).not.toThrow();
      expect(helper.getCodeVerifier()).toBeUndefined();
    });
  });
});
