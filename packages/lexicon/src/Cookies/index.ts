import JsCookie from 'js-cookie';

const cookieTray = {
  accessToken: 'app.at',
  accessTokenExpiration: 'app.at_exp',
  user: 'user',
  lastState: 'lastState',
  identityToken: 'app.idt',
  refreshToken: 'app.rt',
} as const;

type Cookies = typeof cookieTray;

type CookieName = Cookies[keyof Cookies];

type CookieConstructor<CookieClass> = new (name: string) => CookieClass;
type CookieKind =
  | CookieConstructor<UserCookie>
  | CookieConstructor<RefreshTokenCookie>
  | CookieConstructor<LastStateCookie>
  | CookieConstructor<AccessTokenCookie>
  | CookieConstructor<AccessTokenExpirationCookie>
  | CookieConstructor<IdentityTokenCookie>;

export class EmptyCookie<T = CookieKind> {
  readonly kind: CookieKind;

  constructor(kind: CookieKind) {
    this.kind = kind;
  }

  isEmpty(): this is EmptyCookie<T> {
    return true;
  }

  isNotEmpty(): this is T {
    return false;
  }

  fillWith(value: string): T | EmptyCookie<T> {
    const result = JsCookie.set(this.kind.name, value);

    return result ? (new this.kind(value) as T) : this;
  }
}

export class CookieJar {
  static set(
    name: 'app.at',
    value: string,
  ): AccessTokenCookie | EmptyCookie<AccessTokenCookie>;
  static set(
    name: 'app.at_exp',
    value: string,
  ): AccessTokenExpirationCookie | EmptyCookie<AccessTokenExpirationCookie>;
  static set(
    name: 'app.idt',
    value: string,
  ): IdentityTokenCookie | EmptyCookie<IdentityTokenCookie>;
  static set(
    name: 'lastState',
    value: string,
  ): LastStateCookie | EmptyCookie<LastStateCookie>;
  static set(
    name: 'app.rt',
    value: string,
  ): RefreshTokenCookie | EmptyCookie<RefreshTokenCookie>;
  static set(name: 'user', value: string): UserCookie | EmptyCookie<UserCookie>;
  static set(name: CookieName, value: string) {
    const didSetCookieSuccessfully = Boolean(JsCookie.set(name, value));

    switch (name) {
      case 'user':
        return didSetCookieSuccessfully
          ? new UserCookie(value)
          : new EmptyCookie<UserCookie>(UserCookie);
        break;
      case 'lastState':
        return didSetCookieSuccessfully
          ? new LastStateCookie(value)
          : new EmptyCookie<LastStateCookie>(LastStateCookie);
        break;
      case 'app.at':
        return didSetCookieSuccessfully
          ? new AccessTokenCookie(value)
          : new EmptyCookie<AccessTokenCookie>(AccessTokenCookie);
        break;
      case 'app.at_exp':
        return didSetCookieSuccessfully
          ? new AccessTokenExpirationCookie(value)
          : new EmptyCookie<AccessTokenExpirationCookie>(
              AccessTokenExpirationCookie,
            );
        break;
      case 'app.idt':
        return didSetCookieSuccessfully
          ? new IdentityTokenCookie(value)
          : new EmptyCookie<IdentityTokenCookie>(IdentityTokenCookie);
        break;
      case 'app.rt':
        return didSetCookieSuccessfully
          ? new RefreshTokenCookie(value)
          : new EmptyCookie<RefreshTokenCookie>(RefreshTokenCookie);
        break;
    }
  }

  static get(
    name: 'app.at',
  ): AccessTokenCookie | EmptyCookie<AccessTokenCookie>;
  static get(
    name: 'app.at_exp',
  ): AccessTokenExpirationCookie | EmptyCookie<AccessTokenExpirationCookie>;
  static get(
    name: 'app.idt',
  ): IdentityTokenCookie | EmptyCookie<IdentityTokenCookie>;
  static get(name: 'lastState'): LastStateCookie | EmptyCookie<LastStateCookie>;
  static get(
    name: 'app.rt',
  ): RefreshTokenCookie | EmptyCookie<RefreshTokenCookie>;
  static get(name: 'user'): UserCookie | EmptyCookie<UserCookie>;
  static get(name: CookieName) {
    const result = JsCookie.get(name);

    switch (name) {
      case 'user':
        return result
          ? new UserCookie(result)
          : new EmptyCookie<UserCookie>(UserCookie); // do we need to specify the generic here?
        break;
      case 'lastState':
        return result
          ? new LastStateCookie(result)
          : new EmptyCookie<LastStateCookie>(LastStateCookie);
        break;
      case 'app.at':
        return result
          ? new AccessTokenCookie(result)
          : new EmptyCookie<AccessTokenCookie>(AccessTokenCookie);
        break;
      case 'app.at_exp':
        return result
          ? new AccessTokenExpirationCookie(result)
          : new EmptyCookie<AccessTokenExpirationCookie>(
              AccessTokenExpirationCookie,
            );
        break;
      case 'app.idt':
        return result
          ? new IdentityTokenCookie(result)
          : new EmptyCookie<IdentityTokenCookie>(IdentityTokenCookie);
        break;
      case 'app.rt':
        return result
          ? new RefreshTokenCookie(result)
          : new EmptyCookie<RefreshTokenCookie>(RefreshTokenCookie);
        break;
    }
  }
}

export abstract class Cookie<T> {
  #value: string;
  #name: CookieName;
  #kind: CookieKind;

  constructor(kind: CookieKind, name: CookieName, value: string) {
    this.#kind = kind;
    this.#name = name;
    this.#value = value;
  }

  isNotEmpty(): this is T {
    return true;
  }

  isEmpty(): this is EmptyCookie<T> {
    return false;
  }

  name() {
    return this.#name;
  }

  set(value: string): T | EmptyCookie<T> {
    const result = JsCookie.set(this.#name, value);

    if (!result) {
      return new EmptyCookie<T>(this.#kind);
    }

    return new this.#kind(result) as T;
  }

  remove() {
    JsCookie.remove(this.#name);
  }

  value() {
    return this.#value;
  }
}

export class UserCookie extends Cookie<UserCookie> {
  static #name: typeof cookieTray.user = cookieTray.user;

  constructor(value: string) {
    super(UserCookie, cookieTray.user, value);
  }

  static name() {
    return this.#name;
  }

  refresh() {
    return CookieJar.get(cookieTray.user);
  }
}

export class LastStateCookie extends Cookie<LastStateCookie> {
  static #name: typeof cookieTray.lastState = cookieTray.lastState;

  constructor(value: string) {
    super(LastStateCookie, cookieTray.lastState, value);
  }

  static name() {
    return this.#name;
  }

  refresh() {
    return CookieJar.get(cookieTray.lastState);
  }
}

export class AccessTokenCookie extends Cookie<AccessTokenCookie> {
  static #name: typeof cookieTray.accessToken = cookieTray.accessToken;

  constructor(value: string) {
    super(AccessTokenCookie, cookieTray.lastState, value);
  }

  static name() {
    return this.#name;
  }

  refresh() {
    return CookieJar.get(cookieTray.accessToken);
  }
}

export class AccessTokenExpirationCookie extends Cookie<AccessTokenExpirationCookie> {
  static #name: typeof cookieTray.accessTokenExpiration =
    cookieTray.accessTokenExpiration;

  constructor(value: string) {
    super(AccessTokenExpirationCookie, cookieTray.lastState, value);
  }

  static name() {
    return this.#name;
  }

  refresh() {
    return CookieJar.get(cookieTray.accessTokenExpiration);
  }

  getExpirationTimeInMs() {
    return parseInt(this.value() ?? '0') * 1000;
  }

  isExpired(): boolean {
    return this.getExpirationTimeInMs() <= new Date().getTime();
  }
}

export class IdentityTokenCookie extends Cookie<IdentityTokenCookie> {
  static #name: typeof cookieTray.identityToken = cookieTray.identityToken;

  constructor(value: string) {
    super(IdentityTokenCookie, cookieTray.lastState, value);
  }

  static name() {
    return this.#name;
  }

  refresh() {
    return CookieJar.get(cookieTray.identityToken);
  }
}

export class RefreshTokenCookie extends Cookie<RefreshTokenCookie> {
  static #name: typeof cookieTray.refreshToken = cookieTray.refreshToken;

  constructor(value: string) {
    super(RefreshTokenCookie, cookieTray.lastState, value);
  }

  static name() {
    return this.#name;
  }

  refresh() {
    return CookieJar.get(cookieTray.refreshToken);
  }
}
