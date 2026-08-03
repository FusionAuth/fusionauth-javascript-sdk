import { useState, useCallback, useRef, useEffect } from 'react';

import { SDKCore } from '@fusionauth-sdk/core';

export function useUserInfo<T>(
  core: SDKCore,
  shouldAutoFetchUserInfo: boolean,
  isLoggedIn: boolean,
) {
  const [isFetchingUserInfo, setIsFetchingUserInfo] = useState(false);
  const [userInfo, setUserInfo] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserInfo = useCallback(async () => {
    setIsFetchingUserInfo(true);
    setError(null);

    try {
      const userInfo = await core.fetchUserInfo<T>();
      setUserInfo(userInfo);
      return userInfo;
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsFetchingUserInfo(false);
    }
  }, [core]);

  const didAttemptAutoFetch = useRef(false);

  const handleAutoFetch = useCallback(() => {
    if (
      !shouldAutoFetchUserInfo ||
      didAttemptAutoFetch.current ||
      !isLoggedIn
    ) {
      return;
    }

    // ensures this effect does not run multiple times if we fail to fetch the user
    didAttemptAutoFetch.current = true;

    fetchUserInfo();
  }, [fetchUserInfo, shouldAutoFetchUserInfo, isLoggedIn]);

  useEffect(() => {
    handleAutoFetch();
  }, [handleAutoFetch]);

  return {
    fetchUserInfo,
    isFetchingUserInfo,
    userInfo,
    error,
  };
}
