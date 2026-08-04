import { useCallback, useEffect } from 'react';
import { SDKCore } from '@fusionauth-sdk/core';

export function useRedirecting(
  core: SDKCore,
  onRedirect?: (state?: string) => void,
  onPostRedirectSettled?: () => void,
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
    (async () => {
      await core.handlePostRedirect(onRedirect);
      onPostRedirectSettled?.();
    })();
  }, [core, onRedirect, onPostRedirectSettled]);

  return {
    manageAccount,
    startLogin,
    startRegister,
    startLogout,
  };
}
