/**
 * Creating classes for the "path" concept
 * lets us use robust, strict typing. I.e.
 * functions can accept and return specific
 * paths. This also lets us bundle up the
 * fallback values with each path.
 */

export const defaultPathValues = {
  login: '/app/login',
  logout: '/app/logout',
  me: '/app/me',
  register: '/app/register',
  tokenRefresh: '/app/refresh',
};

export abstract class Path {
  private readonly defaultValue: string;
  private readonly value?: string;

  constructor(defaultValue: string, value?: string) {
    this.defaultValue = defaultValue;
    this.value = value;
  }

  getValue() {
    return this.value || this.defaultValue;
  }
}

export class LoginPath extends Path {
  constructor(customValue?: string) {
    super(defaultPathValues.login, customValue);
  }
}

export class LogoutPath extends Path {
  constructor(customValue?: string) {
    super(defaultPathValues.logout, customValue);
  }
}

export class MePath extends Path {
  constructor(customValue?: string) {
    super(defaultPathValues.me, customValue);
  }
}

export class RegisterPath extends Path {
  constructor(customValue?: string) {
    super(defaultPathValues.register, customValue);
  }
}

export class TokenRefreshPath extends Path {
  constructor(customValue?: string) {
    super(defaultPathValues.tokenRefresh, customValue);
  }
}

export const makePaths = (params?: {
  loginPath?: string;
  logoutPath?: string;
  mePath?: string;
  registerPath?: string;
  tokenRefreshPath?: string;
}): {
  loginPath: LoginPath;
  logoutPath: LogoutPath;
  mePath: MePath;
  registerPath: RegisterPath;
  tokenRefreshPath: TokenRefreshPath;
} => {
  return {
    loginPath: new LoginPath(params?.loginPath),
    logoutPath: new LogoutPath(params?.logoutPath),
    registerPath: new RegisterPath(params?.registerPath),
    tokenRefreshPath: new TokenRefreshPath(params?.tokenRefreshPath),
    mePath: new MePath(params?.mePath),
  };
};
