import { PropsWithChildren, useContext, useMemo, useState, FC } from 'react';

import { SDKCore } from '@fusionauth-sdk/core';

import { FusionAuthProviderConfig } from './FusionAuthProviderConfig';
import {
  useTokenRefresh,
  useRedirecting,
  useUserInfo,
  useCookieAdapter,
} from './hooks';
import { FusionAuthContext } from './Context';
import { FusionAuthProviderContext } from './FusionAuthProviderContext';

const FusionAuthProvider: FC<
  FusionAuthProviderConfig & PropsWithChildren
> = props => {
  const config = useMemo<FusionAuthProviderConfig>(() => {
    const { children, ...config } = props;
    return config;
  }, [props]);

  const cookieAdapter = useCookieAdapter(config);

  const core: SDKCore = useMemo<SDKCore>(() => {
    return new SDKCore({
      ...config,
      onTokenExpiration: () => setIsLoggedIn(false),
      cookieAdapter,
    });
  }, [config, cookieAdapter]);

  const [isLoggedIn, setIsLoggedIn] = useState(core.isLoggedIn);

  const { startLogin, startLogout, startRegister } = useRedirecting(
    core,
    config.onRedirect,
  );

  const { isFetchingUserInfo, userInfo, fetchUserInfo, error } = useUserInfo(
    core,
    config.shouldAutoFetchUserInfo ?? false,
  );

  const { refreshToken, initAutoRefresh } = useTokenRefresh(
    core,
    config.shouldAutoRefresh ?? false,
  );

  const providerValue: FusionAuthProviderContext = {
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
  };

  return (
    <FusionAuthContext.Provider value={providerValue}>
      {props.children}
    </FusionAuthContext.Provider>
  );
};

/**
 * A hook that returns `FusionAuthProviderContext`
 */
const useFusionAuth = () => useContext(FusionAuthContext);

export { FusionAuthProvider, useFusionAuth };
