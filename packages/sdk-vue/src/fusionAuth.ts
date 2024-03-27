import type { FusionAuth, FusionAuthConfig, UserInfo } from './types';
import { doRedirectForPath, getFormattedPath, getURLForPath } from './utils';
import { CookieHelpers } from '@fusionauth-sdk/core';

const DEFAULT_ACCESS_TOKEN_EXPIRE_WINDOW = 30000;

export const createFusionAuth = (config: FusionAuthConfig): FusionAuth => {
  async function getUserInfo(): Promise<UserInfo> {
    const path = getFormattedPath(config.mePath, '/app/me');
    const uri = getURLForPath(config, path);
    const resp = await fetch(uri, {
      credentials: 'include',
    });
    return await resp.json();
  }

  function isLoggedIn(): boolean {
    return (
      (CookieHelpers.getAuthTokenExpirationTime() ?? 0) > new Date().getTime()
    );
  }

  function login(state?: string): void {
    const path = getFormattedPath(config.loginPath, '/app/login');
    doRedirectForPath(config, path, { state });
  }

  function logout(): void {
    const path = getFormattedPath(config.logoutPath, '/app/logout');
    doRedirectForPath(config, path);
  }

  async function refreshToken(): Promise<void> {
    const timeWindow =
      config.accessTokenExpireWindow ?? DEFAULT_ACCESS_TOKEN_EXPIRE_WINDOW;
    const expiresAt = CookieHelpers.getAuthTokenExpirationTime();
    if (!expiresAt || expiresAt > Date.now() + timeWindow) return;

    const tokenRefreshPath = getFormattedPath(
      config.tokenRefreshPath,
      '/app/refresh',
    );
    const path = `${tokenRefreshPath}/${config.clientId}`;
    const uri = getURLForPath(config, path);
    const resp = await fetch(uri, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    if (!(resp.status >= 200 && resp.status < 300)) {
      throw new Error('Error refreshing access token in fusionauth');
    }
  }

  function register(state?: string): void {
    const path = config.registerPath ?? '/app/register';
    doRedirectForPath(config, path, { state });
  }

  function autoRefresh(): void {
    const expiresAt = CookieHelpers.getAuthTokenExpirationTime();
    if (!expiresAt) return;

    const refreshBuffer = (config.autoRefreshSecondsBeforeExpiry ?? 10) * 1000;
    const refreshAt = expiresAt - refreshBuffer;
    const timeToRefresh = Math.max(0, refreshAt - Date.now());
    setTimeout(() => {
      (async () => {
        try {
          await refreshToken();
          autoRefresh();
        } catch (e) {
          console.error('Error refreshing access token in fusionauth', e);
        }
      })();
    }, timeToRefresh);
  }

  if (config.autoRefreshSecondsBeforeExpiry) {
    autoRefresh();
  }

  return {
    getUserInfo,
    isLoggedIn,
    login,
    logout,
    refreshToken,
    register,
  };
};
