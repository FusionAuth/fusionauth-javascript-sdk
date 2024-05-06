// @ts-nocheck
const u = Object.defineProperty;
const d = (r, e, t) =>
  e in r
    ? u(r, e, { enumerable: !0, configurable: !0, writable: !0, value: t })
    : (r[e] = t);
const i = (r, e, t) => (d(r, typeof e != 'symbol' ? e + '' : e, t), t);
class g {
  constructor(e) {
    i(this, 'serverUrl');
    i(this, 'clientId');
    i(this, 'redirectUri');
    i(this, 'scope');
    i(this, 'mePath');
    i(this, 'loginPath');
    i(this, 'registerPath');
    i(this, 'logoutPath');
    i(this, 'tokenRefreshPath');
    (this.serverUrl = e.serverUrl),
      (this.clientId = e.clientId),
      (this.redirectUri = e.redirectUri),
      (this.scope = e.scope),
      (this.mePath = e.mePath ?? '/app/me'),
      (this.loginPath = e.loginPath ?? '/app/login'),
      (this.registerPath = e.registerPath ?? '/app/register'),
      (this.logoutPath = e.logoutPath ?? '/app/logout'),
      (this.tokenRefreshPath = e.tokenRefreshPath ?? '/app/refresh');
  }
  getMeUrl() {
    return this.generateUrl(this.mePath);
  }
  getLoginUrl(e) {
    return this.generateUrl(this.loginPath, {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      state: e,
    });
  }
  getRegisterUrl(e) {
    return this.generateUrl(this.registerPath, {
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scope,
      state: e,
    });
  }
  getLogoutUrl() {
    return this.generateUrl(this.logoutPath, {
      client_id: this.clientId,
      post_logout_redirect_uri: this.redirectUri,
    });
  }
  getTokenRefreshUrl() {
    return this.generateUrl(this.tokenRefreshPath, {
      client_id: this.clientId,
    });
  }
  generateUrl(e, t) {
    const s = new URL(this.serverUrl);
    if (((s.pathname = e), t)) {
      const n = this.generateURLSearchParams(t);
      s.search = n.toString();
    }
    return s;
  }
  generateURLSearchParams(e) {
    const t = new URLSearchParams();
    return (
      Object.entries(e).forEach(([s, n]) => {
        n && t.append(s, n);
      }),
      t
    );
  }
}
class o {
  /**
   * Parses document.cookie for the access token expiration cookie value.
   * @returns {(number | null)} The moment of expiration in milliseconds since epoch.
   */
  static getAccessTokenExpirationMoment(e = 'app.at_exp') {
    const t = document.cookie
        .split('; ')
        .map(n => n.split('='))
        .find(([n]) => n === e),
      s = t == null ? void 0 : t[1];
    return s ? parseInt(s) * 1e3 : null;
  }
}
class p {
  constructor(e) {
    i(this, 'url');
    this.url = e;
  }
  /** Refresh token a single time */
  async refreshToken() {
    const e = await fetch(this.url.href, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    if (!(e.status >= 200 && e.status < 300))
      throw new Error('error refreshing access token in fusionauth');
  }
  /** Initializes continuous automatic token refresh. */
  initAutoRefresh(e = 10, t) {
    const s = o.getAccessTokenExpirationMoment(t);
    if (!s) return;
    const n = e * 1e3,
      a = /* @__PURE__ */ new Date().getTime(),
      h = s - n,
      c = Math.max(h - a, 0);
    return setTimeout(async () => {
      try {
        await this.refreshToken(), this.initAutoRefresh(e);
      } catch (l) {
        console.error(l);
      }
    }, c);
  }
}
class m {
  /**
   * Schedules a callback to be invoked at the given moment.
   * @param expirationMoment - the access token expiration moment in milliseconds since the epoch.
   * @param onExpiration - the callback to be invoked at the `expirationMoment`.
   */
  static scheduleTokenExpirationCallback(e, t) {
    const s = /* @__PURE__ */ new Date().getTime(),
      n = e - s;
    n > 0 && setTimeout(t, n);
  }
}
class R {
  constructor() {
    i(this, 'REDIRECT_VALUE', 'fa-sdk-redirect-value');
  }
  handlePreRedirect(e) {
    const t = `${this.generateRandomString()}:${e ?? ''}`;
    localStorage.setItem(this.REDIRECT_VALUE, t);
  }
  handlePostRedirect(e) {
    const t = this.stateValue ?? void 0;
    e == null || e(t), localStorage.removeItem(this.REDIRECT_VALUE);
  }
  get didRedirect() {
    return !!localStorage.getItem(this.REDIRECT_VALUE);
  }
  get stateValue() {
    const e = localStorage.getItem(this.REDIRECT_VALUE);
    if (!e) return null;
    const [, ...t] = e.split(':');
    return t.join(':');
  }
  generateRandomString() {
    const e = new Uint32Array(28);
    return (
      window.crypto.getRandomValues(e),
      Array.from(e, t => ('0' + t.toString(16)).substring(-2)).join('')
    );
  }
}
class T {
  constructor(e) {
    i(this, 'config');
    i(this, 'urlHelper');
    i(this, 'tokenRefresher');
    i(this, 'redirectHelper', new R());
    (this.config = e),
      (this.urlHelper = new g({
        serverUrl: e.serverUrl,
        clientId: e.clientId,
        redirectUri: e.redirectUri,
        scope: e.scope,
        mePath: e.mePath,
        loginPath: e.loginPath,
        registerPath: e.registerPath,
        logoutPath: e.logoutPath,
        tokenRefreshPath: e.tokenRefreshPath,
      })),
      (this.tokenRefresher = new p(this.urlHelper.getTokenRefreshUrl())),
      this.scheduleTokenExpirationEvent();
  }
  startLogin(e) {
    this.redirectHelper.handlePreRedirect(e),
      window.location.assign(this.urlHelper.getLoginUrl(e));
  }
  startRegister(e) {
    this.redirectHelper.handlePreRedirect(e),
      window.location.assign(this.urlHelper.getRegisterUrl(e));
  }
  startLogout() {
    window.location.assign(this.urlHelper.getLogoutUrl());
  }
  async fetchUserInfo() {
    const e = await fetch(this.urlHelper.getMeUrl(), {
      credentials: 'include',
    });
    if (!e.ok)
      throw new Error(
        `Unable to fetch userInfo in fusionauth. Request failed with status code ${e == null ? void 0 : e.status}`,
      );
    return await e.json();
  }
  async refreshToken() {
    return await this.tokenRefresher.refreshToken();
  }
  initAutoRefresh() {
    return this.tokenRefresher.initAutoRefresh(
      this.config.autoRefreshSecondsBeforeExpiry,
      this.config.accessTokenExpireCookieName,
    );
  }
  handlePostRedirect(e) {
    this.isLoggedIn &&
      this.redirectHelper.didRedirect &&
      this.redirectHelper.handlePostRedirect(e);
  }
  get isLoggedIn() {
    return this.accessTokenExpirationMoment
      ? this.accessTokenExpirationMoment > /* @__PURE__ */ new Date().getTime()
      : !1;
  }
  get accessTokenExpirationMoment() {
    return o.getAccessTokenExpirationMoment(
      this.config.accessTokenExpireCookieName,
    );
  }
  scheduleTokenExpirationEvent() {
    this.accessTokenExpirationMoment &&
      this.config.onTokenExpiration &&
      m.scheduleTokenExpirationCallback(
        this.accessTokenExpirationMoment,
        this.config.onTokenExpiration,
      );
  }
}
function U() {
  const r = /* @__PURE__ */ new Date();
  r.setHours(r.getHours() + 1);
  const e = r.getTime() / 1e3;
  document.cookie = `app.at_exp=${e}`;
}
function P() {
  document.cookie = 'app.at_exp=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
function E(r) {
  const e = {
    ...window.location,
    assign: r.fn(),
  };
  return r.spyOn(window, 'location', 'get').mockReturnValue(e), e;
}
export {
  o as CookieHelpers,
  T as SDKCore,
  p as TokenRefresher,
  g as UrlHelper,
  U as mockIsLoggedIn,
  E as mockWindowLocation,
  P as removeAt_expCookie,
};
