import { afterEach, describe, expect, it, vi } from 'vitest';
import { RedirectHelper } from './RedirectHelper';

describe('RedirectHelper', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Cookie-mode (non-DPoP) — backward-compatibility
  // ---------------------------------------------------------------------------

  describe('handlePreRedirect / handlePostRedirect (cookie mode)', () => {
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

  // ---------------------------------------------------------------------------
  // DPoP mode — code_verifier persistence
  // ---------------------------------------------------------------------------

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

    it('returns undefined from getCodeVerifier() when no verifier was stored (cookie mode)', () => {
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
});
