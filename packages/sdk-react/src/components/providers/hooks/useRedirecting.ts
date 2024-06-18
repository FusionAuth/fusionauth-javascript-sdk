import { useCallback, useEffect } from 'react';
import { SDKCore } from '@fusionauth-sdk/core';

export function useRedirecting(
  core: SDKCore,
  onRedirect?: (state?: string) => void,
) {
  const manageAccount = useCallback(() => core.manageAccount(), [core]);
  const startLogin = useCallback(
    (state?: string) => core.startLogin(state),
    [core],
  );
  const startRegister = useCallback(
    (state?: string) => core.startRegister(state),
    [core],
  );
  const startLogout = useCallback(() => core.startLogout(), [core]);

  useEffect(() => {
    core.handlePostRedirect(onRedirect);
  }, [core, onRedirect]);

  return {
    manageAccount,
    startLogin,
    startRegister,
    startLogout,
  };
}
