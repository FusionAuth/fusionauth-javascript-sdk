import { describe, it, expect } from 'vitest';

import { UrlHelper, UrlHelperConfig } from '.';

describe('UrlHelper', () => {
  const config: UrlHelperConfig = {
    serverUrl: 'http://my-server',
    clientId: 'abc123',
    redirectUri: 'http://my-client',
    scope: 'openid email profile offline_access',
    authParams: [{ idp_hint: '44449786-3dff-42a6-aac6-1f1ceecb6c46' }],
    postLogoutRedirectUri: 'http://example.com',
  };

  const urlHelper = new UrlHelper(config);

  it('me url', () => {
    const meUrl = urlHelper.getMeUrl();
    expect(meUrl.origin).toBe(config.serverUrl);
    expect(meUrl.pathname).toBe('/app/me/');
    expect(meUrl.search).toBe('');
  });

  it('login url', () => {
    const stateValue = 'login-state-value';
    const loginUrl = urlHelper.getLoginUrl(stateValue);
    expect(loginUrl.origin).toBe(config.serverUrl);
    expect(loginUrl.pathname).toBe('/app/login/');
    expect(loginUrl.searchParams.get('client_id')).toBe(config.clientId);
    expect(loginUrl.searchParams.get('redirect_uri')).toBe(config.redirectUri);
    expect(loginUrl.searchParams.get('scope')).toBe(config.scope);
    expect(loginUrl.searchParams.get('state')).toBe(stateValue);
  });

  it('login url authParams', () => {
    const stateValue = 'login-state-value';
    const loginUrl = urlHelper.getLoginUrl(stateValue);
    expect(loginUrl.origin).toBe(config.serverUrl);
    expect(loginUrl.pathname).toBe('/app/login/');
    expect(loginUrl.searchParams.get('idp_hint')).toBe(
      config.authParams?.at(0)?.idp_hint,
    );
  });

  it('register url', () => {
    const stateValue = 'register-state-value';
    const registerUrl = urlHelper.getRegisterUrl(stateValue);
    expect(registerUrl.origin).toBe(config.serverUrl);
    expect(registerUrl.pathname).toBe('/app/register/');
    expect(registerUrl.searchParams.get('client_id')).toBe(config.clientId);
    expect(registerUrl.searchParams.get('redirect_uri')).toBe(
      config.redirectUri,
    );
    expect(registerUrl.searchParams.get('scope')).toBe(config.scope);
    expect(registerUrl.searchParams.get('state')).toBe(stateValue);
  });

  it('logout url', () => {
    const logoutUrl = urlHelper.getLogoutUrl();
    expect(logoutUrl.origin).toBe(config.serverUrl);
    expect(logoutUrl.pathname).toBe('/app/logout/');
    expect(logoutUrl.searchParams.get('client_id')).toBe(config.clientId);
    expect(logoutUrl.searchParams.get('post_logout_redirect_uri')).toBe(
      config.postLogoutRedirectUri,
    );
  });

  it('logout url - default post_logout_redirect_uri', () => {
    const configWithoutPostLogoutRedirectUri: UrlHelperConfig = {
      serverUrl: 'http://my-server',
      clientId: 'abc123',
      redirectUri: 'http://my-client',
      scope: 'openid email profile offline_access',
    };

    const urlHelperWithoutPostLogoutRedirectUri = new UrlHelper(
      configWithoutPostLogoutRedirectUri,
    );
    const logoutUrl = urlHelperWithoutPostLogoutRedirectUri.getLogoutUrl();
    expect(logoutUrl.origin).toBe(configWithoutPostLogoutRedirectUri.serverUrl);
    expect(logoutUrl.pathname).toBe('/app/logout/');
    expect(logoutUrl.searchParams.get('client_id')).toBe(
      configWithoutPostLogoutRedirectUri.clientId,
    );
    expect(logoutUrl.searchParams.get('post_logout_redirect_uri')).toBe(
      configWithoutPostLogoutRedirectUri.redirectUri,
    );
  });

  it('tokenRefresh url', () => {
    const tokenRefreshUrl = urlHelper.getTokenRefreshUrl();
    expect(tokenRefreshUrl.pathname).toBe('/app/refresh/');
    expect(tokenRefreshUrl.searchParams.get('client_id')).toBe(config.clientId);
  });

  it('account management url', () => {
    const accountManagementUrl = urlHelper.getAccountManagementUrl();
    expect(accountManagementUrl.pathname).toBe('/account/');
    expect(accountManagementUrl.searchParams.get('client_id')).toBe(
      config.clientId,
    );
  });

  it('Should generate urls with a specified path', () => {
    const paths = {
      mePath: '/my-me',
      loginPath: '/my-login',
      registerPath: '/my-register',
      logoutPath: '/my-logout',
      tokenRefreshPath: '/my-refresh',
    };
    const { me, login, register, logout, tokenRefresh } = getAllUrls(
      new UrlHelper({
        ...config,
        ...paths,
      }),
    );

    expect(me.pathname).toBe(paths.mePath);
    expect(login.pathname).toBe(paths.loginPath);
    expect(register.pathname).toBe(paths.registerPath);
    expect(logout.pathname).toBe(paths.logoutPath);
    expect(tokenRefresh.pathname).toBe(paths.tokenRefreshPath);
  });
});

function getAllUrls(urlHelper: UrlHelper) {
  return {
    me: urlHelper.getMeUrl(),
    login: urlHelper.getLoginUrl(),
    register: urlHelper.getRegisterUrl(),
    logout: urlHelper.getLogoutUrl(),
    tokenRefresh: urlHelper.getTokenRefreshUrl(),
  };
}
