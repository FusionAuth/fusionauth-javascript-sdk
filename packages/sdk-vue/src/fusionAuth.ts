import type { FusionAuth, FusionAuthConfig, UserInfo } from './types';
import { CookieHelpers, TokenRefresher, UrlHelper } from '@fusionauth-sdk/core';

export const createFusionAuth = (config: FusionAuthConfig): FusionAuth => {
  const urlHelper = new UrlHelper({
    serverUrlString: config.serverUrl,
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    mePath: config.mePath,
    loginPath: config.loginPath,
    registerPath: config.registerPath,
    logoutPath: config.logoutPath,
    tokenRefreshPath: config.tokenRefreshPath,
  });
  const tokenRefresher = new TokenRefresher(urlHelper.getTokenRefreshUrl());

  async function getUserInfo(): Promise<UserInfo> {
    const resp = await fetch(urlHelper.getMeUrl(), {
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
    window.location.assign(urlHelper.getLoginUrl(state));
  }

  function logout(): void {
    window.location.assign(urlHelper.getLogoutUrl());
  }

  async function refreshToken(): Promise<void> {
    return await tokenRefresher.refreshToken();
  }

  function register(state?: string): void {
    window.location.assign(urlHelper.getRegisterUrl(state));
  }

  function initAutoRefresh(): NodeJS.Timeout | undefined {
    return tokenRefresher.initAutoRefresh(
      config.autoRefreshSecondsBeforeExpiry ?? 30,
    );
  }

  if (config.shouldAutoRefresh) {
    initAutoRefresh();
  }

  return {
    getUserInfo,
    isLoggedIn,
    login,
    logout,
    refreshToken,
    initAutoRefresh,
    register,
  };
};
