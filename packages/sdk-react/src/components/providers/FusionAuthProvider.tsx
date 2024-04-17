import { PropsWithChildren, useContext, useMemo, useState, FC } from 'react';

import { SDKCore, SDKConfig } from '@fusionauth-sdk/core';

import { FusionAuthProviderConfig } from './FusionAuthProviderConfig';
import { useTokenRefresh, useRedirecting, useUserInfo } from './hooks';
import { FusionAuthContext } from './Context';

const FusionAuthProvider: FC<
  FusionAuthProviderConfig & PropsWithChildren
> = props => {
  const config = useMemo<SDKConfig>(() => {
    const { children, ...config } = props;
    return config;
  }, [props]);

  const core: SDKCore = useMemo<SDKCore>(() => {
    return new SDKCore({
      ...config,
      onTokenExpiration: () => setIsLoggedIn(false),
    });
  }, [config]);

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

  const providerValue = {
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
 * A hook that returns and object containing [`FusionAuthProviderContext`](#interfaces/FusionAuthProviderContext.FusionAuthProviderContext.md)
 */
const useFusionAuth = () => useContext(FusionAuthContext);

export { FusionAuthProvider, useFusionAuth };
