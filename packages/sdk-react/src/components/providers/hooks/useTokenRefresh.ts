import { useEffect, useCallback } from 'react';
import { SDKCore } from '@fusionauth-sdk/core';

export function useTokenRefresh(core: SDKCore, shouldAutoRefresh: boolean) {
  const refreshToken = useCallback(
    async () => await core.refreshToken(),
    [core],
  );

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
