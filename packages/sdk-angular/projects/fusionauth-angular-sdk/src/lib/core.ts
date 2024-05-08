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
      const o = this.generateURLSearchParams(t);
      s.search = o.toString();
    }
    return s;
  }
  generateURLSearchParams(e) {
    const t = new URLSearchParams();
    return (
      Object.entries(e).forEach(([s, o]) => {
        o && t.append(s, o);
      }),
      t
    );
  }
}
class p {
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
function m(r = 'app.at_exp') {
  const e = document.cookie
      .split('; ')
      .map(s => s.split('='))
      .find(([s]) => s === r),
    t = e == null ? void 0 : e[1];
  return t ? parseInt(t) * 1e3 : null;
}
class U {
  constructor(e) {
    i(this, 'config');
    i(this, 'urlHelper');
    i(this, 'redirectHelper', new p());
    i(this, 'tokenExpirationTimeout');
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
      this.scheduleTokenExpiration();
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
    const e = await fetch(this.urlHelper.getTokenRefreshUrl(), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    if (!(e.status >= 200 && e.status < 300)) {
      const t =
        (await (e == null ? void 0 : e.text())) ||
        'Error refreshing access token in fusionauth';
      throw new Error(t);
    }
    return this.scheduleTokenExpiration(), e;
  }
  initAutoRefresh() {
    const e = this.at_exp,
      t = this.config.autoRefreshSecondsBeforeExpiry ?? 10;
    if (!e) return;
    const s = t * 1e3,
      o = /* @__PURE__ */ new Date().getTime(),
      h = e - s,
      l = Math.max(h - o, 0);
    return setTimeout(async () => {
      let n, a;
      try {
        await this.refreshToken(), this.initAutoRefresh();
      } catch (c) {
        (a = (n = this.config).onAutoRefreshFailure) == null || a.call(n, c);
      }
    }, l);
  }
  handlePostRedirect(e) {
    this.isLoggedIn &&
      this.redirectHelper.didRedirect &&
      this.redirectHelper.handlePostRedirect(e);
  }
  get isLoggedIn() {
    return this.at_exp
      ? this.at_exp > /* @__PURE__ */ new Date().getTime()
      : !1;
  }
  /** The moment of access token expiration in milliseconds since epoch. */
  get at_exp() {
    return m(this.config.accessTokenExpireCookieName);
  }
  /** Schedules `onTokenExpiration` at moment of access token expiration. */
  scheduleTokenExpiration() {
    clearTimeout(this.tokenExpirationTimeout);
    const e = this.at_exp ?? -1,
      t = /* @__PURE__ */ new Date().getTime(),
      s = e - t;
    s > 0 &&
      (this.tokenExpirationTimeout = setTimeout(
        this.config.onTokenExpiration,
        s,
      ));
  }
}
function P() {
  const r = /* @__PURE__ */ new Date();
  r.setHours(r.getHours() + 1);
  const e = r.getTime() / 1e3;
  document.cookie = `app.at_exp=${e}`;
}
function f() {
  document.cookie = 'app.at_exp=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
function w(r) {
  const e = {
    ...window.location,
    assign: r.fn(),
  };
  return r.spyOn(window, 'location', 'get').mockReturnValue(e), e;
}
export {
  U as SDKCore,
  P as mockIsLoggedIn,
  w as mockWindowLocation,
  f as removeAt_expCookie,
};
