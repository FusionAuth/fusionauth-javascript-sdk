import { useEffect, useCallback } from 'react';
import { SDKCore } from '@fusionauth-sdk/core';

export function useTokenRefresh(
  core: SDKCore,
  shouldAutoRefresh: boolean,
  syncIsLoggedIn?: () => void,
) {
  const refreshToken = useCallback(async () => {
    const response = await core.refreshToken();
    syncIsLoggedIn?.();
    return response;
  }, [core, syncIsLoggedIn]);

  const initAutoRefresh = useCallback(() => {
    core.initAutoRefresh();
  }, [core]);

  useEffect(() => {
    if (shouldAutoRefresh) {
      core.initAutoRefresh();
    }

    // Stop (but don't dispose) the refresh timer on cleanup. This reverses the
    // effect so React StrictMode's mount → unmount → remount cycle restarts a
    // working timer, and prevents background refreshes after the provider
    // unmounts.
    return () => {
      core.stopAutoRefresh();
    };
  }, [core, shouldAutoRefresh]);

  return { refreshToken, initAutoRefresh };
}
