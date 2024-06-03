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
    i(this, 'postLogoutRedirectUri');
    (this.serverUrl = e.serverUrl),
      (this.clientId = e.clientId),
      (this.redirectUri = e.redirectUri),
      (this.scope = e.scope),
      (this.postLogoutRedirectUri = e.postLogoutRedirectUri),
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
      post_logout_redirect_uri: this.postLogoutRedirectUri || this.redirectUri,
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
  get storage() {
    try {
      return localStorage;
    } catch {
      return {
        /* eslint-disable */
        setItem(e, t) {},
        getItem(e) {},
        removeItem(e) {},
        /* eslint-enable */
      };
    }
  }
  handlePreRedirect(e) {
    const t = `${this.generateRandomString()}:${e ?? ''}`;
    this.storage.setItem(this.REDIRECT_VALUE, t);
  }
  handlePostRedirect(e) {
    const t = this.stateValue ?? void 0;
    e == null || e(t), this.storage.removeItem(this.REDIRECT_VALUE);
  }
  get didRedirect() {
    return !!this.storage.getItem(this.REDIRECT_VALUE);
  }
  get stateValue() {
    const e = this.storage.getItem(this.REDIRECT_VALUE);
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
function m(r = 'app.at_exp', e) {
  if (e) return c(e.at_exp(r));
  let t;
  try {
    t = document.cookie;
  } catch {
    return (
      console.error(
        'Error accessing cookies in fusionauth. If you are using SSR you must configure the SDK with a cookie adapter',
      ),
      -1
    );
  }
  const s = t
      .split('; ')
      .map(n => n.split('='))
      .find(([n]) => n === r),
    o = s == null ? void 0 : s[1];
  return c(o);
}
function c(r) {
  return r ? Number(r) * 1e3 : -1;
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
        postLogoutRedirectUri: e.postLogoutRedirectUri,
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
    if (!this.isLoggedIn) return;
    const t = (this.config.autoRefreshSecondsBeforeExpiry ?? 10) * 1e3,
      s = /* @__PURE__ */ new Date().getTime(),
      o = this.at_exp - t,
      n = Math.max(o - s, 0);
    return setTimeout(async () => {
      let a, h;
      try {
        await this.refreshToken(), this.initAutoRefresh();
      } catch (l) {
        (h = (a = this.config).onAutoRefreshFailure) == null || h.call(a, l);
      }
    }, n);
  }
  handlePostRedirect(e) {
    this.isLoggedIn &&
      this.redirectHelper.didRedirect &&
      this.redirectHelper.handlePostRedirect(e);
  }
  get isLoggedIn() {
    return this.at_exp > /* @__PURE__ */ new Date().getTime();
  }
  /** The moment of access token expiration in milliseconds since epoch. */
  get at_exp() {
    return m(
      this.config.accessTokenExpireCookieName,
      this.config.cookieAdapter,
    );
  }
  /** Schedules `onTokenExpiration` at moment of access token expiration. */
  scheduleTokenExpiration() {
    clearTimeout(this.tokenExpirationTimeout);
    const e = /* @__PURE__ */ new Date().getTime(),
      t = this.at_exp - e;
    t > 0 &&
      (this.tokenExpirationTimeout = setTimeout(
        this.config.onTokenExpiration,
        t,
      ));
  }
}
function f() {
  const r = /* @__PURE__ */ new Date();
  r.setHours(r.getHours() + 1);
  const e = r.getTime() / 1e3;
  document.cookie = `app.at_exp=${e}`;
}
function P() {
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
  f as mockIsLoggedIn,
  w as mockWindowLocation,
  P as removeAt_expCookie,
};
//# sourceMappingURL=index.js.map
