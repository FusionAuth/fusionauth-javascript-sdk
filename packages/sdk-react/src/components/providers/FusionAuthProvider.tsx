import {
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
  useRef,
} from 'react';

import { SDKConfig, SDKCore } from '@fusionauth-sdk/core';

import { FusionAuthProviderConfig } from './FusionAuthProviderConfig';
import {
  useTokenRefresh,
  useRedirecting,
  useUserInfo,
  useCookieAdapter,
} from './hooks';
import { FusionAuthContext, UserInfo as DefaultUserInfo } from './Context';
import { FusionAuthProviderContext } from './FusionAuthProviderContext';

function FusionAuthProvider<T = DefaultUserInfo>(
  props: PropsWithChildren & FusionAuthProviderConfig,
) {
  const config: Omit<SDKConfig, 'cookieAdapter' | 'onTokenExpiration'> =
    useMemo(
      () => ({
        serverUrl: props.serverUrl,
        clientId: props.clientId,
        redirectUri: props.redirectUri,
        scope: props.scope,
        authParams: props.authParams,
        postLogoutRedirectUri: props.postLogoutRedirectUri,
        shouldAutoRefresh: props.shouldAutoRefresh,
        shouldAutoFetchUserInfo: props.shouldAutoFetchUserInfo,
        autoRefreshSecondsBeforeExpiry: props.autoRefreshSecondsBeforeExpiry,
        onRedirect: props.onRedirect,
        loginPath: props.loginPath,
        logoutPath: props.logoutPath,
        registerPath: props.registerPath,
        tokenRefreshPath: props.tokenRefreshPath,
        mePath: props.mePath,
        accessTokenExpireCookieName: props.accessTokenExpireCookieName,
        onAutoRefreshFailure: props.onAutoRefreshFailure,
      }),
      [
        props.serverUrl,
        props.clientId,
        props.redirectUri,
        props.scope,
        props.authParams,
        props.postLogoutRedirectUri,
        props.shouldAutoRefresh,
        props.shouldAutoFetchUserInfo,
        props.autoRefreshSecondsBeforeExpiry,
        props.onRedirect,
        props.loginPath,
        props.logoutPath,
        props.registerPath,
        props.tokenRefreshPath,
        props.mePath,
        props.accessTokenExpireCookieName,
        props.onAutoRefreshFailure,
      ],
    );

  const cookieAdapter = useCookieAdapter(config);

  const coreRef = useRef<SDKCore>();
  const core: SDKCore = useMemo<SDKCore>(() => {
    if (coreRef.current) {
      coreRef.current.dispose();
    }

    const newCore = new SDKCore({
      ...config,
      cookieAdapter,
      onTokenExpiration: () => setIsLoggedIn(false),
    });
    coreRef.current = newCore;
    return newCore;
  }, [config, cookieAdapter]);

  const [isLoggedIn, setIsLoggedIn] = useState(core.isLoggedIn);

  const { manageAccount, startLogin, startLogout, startRegister } =
    useRedirecting(core, config.onRedirect);

  const { isFetchingUserInfo, userInfo, fetchUserInfo, error } = useUserInfo<T>(
    core,
    config.shouldAutoFetchUserInfo ?? false,
  );

  const { refreshToken, initAutoRefresh } = useTokenRefresh(
    core,
    config.shouldAutoRefresh ?? false,
  );

  const providerValue: FusionAuthProviderContext<T> = {
    startLogin,
    startRegister,
    startLogout,
    isLoggedIn,
    isFetchingUserInfo,
    error,
    userInfo,
    refreshToken,
    initAutoRefresh,
    fetchUserInfo,
    manageAccount,
  };

  return (
    <FusionAuthContext.Provider value={providerValue}>
      {props.children}
    </FusionAuthContext.Provider>
  );
}

/**
 * A hook that returns `FusionAuthProviderContext`
 */
function useFusionAuth<T = DefaultUserInfo>() {
  return useContext<FusionAuthProviderContext<T>>(FusionAuthContext);
}

export { FusionAuthProvider, useFusionAuth };
