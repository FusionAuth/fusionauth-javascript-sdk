import {
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
  useRef,
} from 'react';

import { SDKCore } from '@fusionauth-sdk/core';

import { FusionAuthProviderConfig } from './FusionAuthProviderConfig';
import {
  useTokenRefresh,
  useRedirecting,
  useUserInfo,
  useCookieAdapter,
} from './hooks';
import { FusionAuthContext, UserInfo as DefaultUserInfo } from './Context';
import { FusionAuthProviderContext } from './FusionAuthProviderContext';

function FusionAuthProvider<T = DefaultUserInfo>({
  children,
  ...config
}: PropsWithChildren & FusionAuthProviderConfig) {
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
      {children}
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
