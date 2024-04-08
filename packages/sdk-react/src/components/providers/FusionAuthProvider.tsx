import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Cookies from 'js-cookie';
import { TokenRefresher, UrlHelper } from '@fusionauth-sdk/core';

const DEFAULT_SCOPE = 'openid offline_access';
// 30 sec window before making network refresh call
const DEFAULT_ACCESS_TOKEN_EXPIRE_WINDOW = 30;

export interface IFusionAuthContext {
  login: (state?: string) => void;
  logout: () => void;
  register: (state?: string) => void;
  user: Record<string, any>;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshToken: () => Promise<void>;
}

export const FusionAuthContext = React.createContext<IFusionAuthContext>({
  login: () => {},
  logout: () => {},
  register: () => {},
  user: {},
  isLoading: false,
  isAuthenticated: false,
  refreshToken: () => Promise.resolve(),
});

export type RedirectSuccess = (state: string) => void;
export type RedirectFail = (error: any) => void;

export interface FusionAuthConfig extends PropsWithChildren {
  clientID: string;
  serverUrl: string;
  redirectUri: string;
  onRedirectSuccess?: RedirectSuccess;
  onRedirectFail?: RedirectFail;
  scope?: string;
  /** The amount of seconds before the auth token is automatically refreshed. Default is 30. */
  accessTokenExpireWindow?: number;
  accessTokenExpireCookieName?: string;
  loginPath?: string;
  logoutPath?: string;
  registerPath?: string;
  tokenRefreshPath?: string;
  mePath?: string;
}

export const FusionAuthProvider: React.FC<FusionAuthConfig> = props => {
  const {
    children,
    onRedirectSuccess,
    onRedirectFail,
    mePath,
    loginPath,
    registerPath,
    logoutPath,
    tokenRefreshPath,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  type User = Record<string, any>;
  const [user, setUser] = useState<User>({});
  const isAuthenticated = useMemo(() => Object.keys(user).length > 0, [user]);

  const accessTokenExpireCookieName = useMemo(() => {
    if (props.accessTokenExpireCookieName?.length) {
      return props.accessTokenExpireCookieName;
    }

    return 'app.at_exp';
  }, [props.accessTokenExpireCookieName]);

  const paths = useMemo(
    () => ({
      mePath,
      loginPath,
      registerPath,
      logoutPath,
      tokenRefreshPath,
    }),
    [mePath, loginPath, registerPath, logoutPath, tokenRefreshPath],
  );

  const urlHelper = useMemo<UrlHelper>(() => {
    return new UrlHelper({
      serverUrlString: props.serverUrl,
      clientId: props.clientID,
      redirectUri: props.redirectUri,
      scope: props.scope ?? DEFAULT_SCOPE,
      ...paths,
    });
  }, [props.scope, props.serverUrl, props.clientID, props.redirectUri, paths]);

  const login = useCallback(
    (state = '') => {
      setUpRedirect(state);
      const loginUrl = urlHelper.getLoginUrl(state);
      window.location.assign(loginUrl);
    },
    [urlHelper],
  );

  const logout = useCallback(() => {
    // Clear cookies
    Cookies.remove('user');
    Cookies.remove('lastState');

    const logoutUrl = urlHelper.getLogoutUrl();
    window.location.assign(logoutUrl);
  }, [urlHelper]);

  const register = useCallback(
    (state = '') => {
      setUpRedirect(state);
      const registerUrl = urlHelper.getRegisterUrl(state);
      window.location.assign(registerUrl);
    },
    [urlHelper],
  );

  const tokenRefresher = useMemo<TokenRefresher>(() => {
    const tokenRefreshUrl = urlHelper.getTokenRefreshUrl();
    return new TokenRefresher(tokenRefreshUrl);
  }, [urlHelper]);

  const tokenRefreshTimeout = useRef<NodeJS.Timeout | undefined>();
  const initAutoTokenRefresh = useCallback(() => {
    if (tokenRefreshTimeout.current) {
      return;
    }

    tokenRefreshTimeout.current = tokenRefresher.initAutoRefresh(
      props.accessTokenExpireWindow || DEFAULT_ACCESS_TOKEN_EXPIRE_WINDOW,
      accessTokenExpireCookieName,
    );
  }, [
    tokenRefresher,
    accessTokenExpireCookieName,
    props.accessTokenExpireWindow,
  ]);

  useEffect(() => {
    initAutoTokenRefresh();
  }, [initAutoTokenRefresh]);

  const refreshToken = useCallback(
    async () => await tokenRefresher.refreshToken(),
    [tokenRefresher],
  );

  const setUserFromCookie = useCallback((cookie: string) => {
    try {
      /* JSON parse needs try/catch to not crash app */
      const parsedUserCookie = JSON.parse(cookie);
      setUser(parsedUserCookie);
    } catch {
      setUser({});
      Cookies.remove('user');
    }
  }, []);

  const fetchUserFromServer = useCallback(async () => {
    setIsLoading(true);
    // lastState indicates that this is a redirect
    const lastState = Cookies.get('lastState');

    try {
      const response = await fetch(urlHelper.getMeUrl(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(
          `Unable to fetch user. Request failed with status code ${response?.status}`,
        );
      }

      const user = await response.json();
      setUser(user);
      Cookies.set('user', JSON.stringify(user));

      if (lastState) {
        const [, ...stateParam] = lastState.split(':');
        const state = stateParam.join(':');
        onRedirectSuccess?.(state);
      }
    } catch (error) {
      if (lastState) {
        onRedirectFail?.(error);
      }
    }

    Cookies.remove('lastState');
    setIsLoading(false);
  }, [urlHelper, onRedirectSuccess, onRedirectFail]);

  const didAttemptToSetUser = useRef(false);
  useEffect(() => {
    if (isLoading || isAuthenticated || didAttemptToSetUser.current) {
      return;
    }

    // ensures this effect does not run multiple times if we fail to set the user
    didAttemptToSetUser.current = true;

    const userCookie = Cookies.get('user');
    if (userCookie) {
      setUserFromCookie(userCookie);
      return;
    }

    const hasIdToken = Boolean(Cookies.get('app.idt'));
    // the presence of app.idt indicates that we can fetch the user
    if (hasIdToken) {
      fetchUserFromServer();
    }
  }, [isAuthenticated, isLoading, setUserFromCookie, fetchUserFromServer]);

  const providerValue = useMemo(
    () => ({
      login,
      logout,
      register,
      isAuthenticated,
      isLoading,
      user,
      refreshToken,
    }),
    [login, logout, register, isAuthenticated, isLoading, refreshToken, user],
  );

  return (
    <FusionAuthContext.Provider value={providerValue}>
      {children}
    </FusionAuthContext.Provider>
  );
};

export const useFusionAuth = () => useContext(FusionAuthContext);

function setUpRedirect(state = '') {
  const stateParam = `${generateRandomString()}:${state}`;
  Cookies.set('lastState', stateParam);
  return stateParam;
}

function dec2hex(dec: number) {
  return ('0' + dec.toString(16)).substr(-2);
}

function generateRandomString() {
  const array = new Uint32Array(56 / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec2hex).join('');
}
