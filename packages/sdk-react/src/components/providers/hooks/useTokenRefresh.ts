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
      initAutoRefresh();
    }
  }, [initAutoRefresh, shouldAutoRefresh]);

  return { refreshToken, initAutoRefresh };
}
