import { useEffect, useCallback, useRef } from 'react';
import { SDKCore } from '@fusionauth-sdk/core';

export function useTokenRefresh(core: SDKCore, shouldAutoRefresh: boolean) {
  const refreshToken = useCallback(
    async () => await core.refreshToken(),
    [core],
  );

  const autoRefreshTimeout = useRef<NodeJS.Timeout | undefined>();
  const initAutoRefresh = useCallback(() => {
    if (autoRefreshTimeout.current) {
      return;
    }
    autoRefreshTimeout.current = core.initAutoRefresh();
  }, [core]);

  useEffect(() => {
    if (shouldAutoRefresh) {
      initAutoRefresh();
    }
  }, [initAutoRefresh, shouldAutoRefresh]);

  return { refreshToken, initAutoRefresh };
}
