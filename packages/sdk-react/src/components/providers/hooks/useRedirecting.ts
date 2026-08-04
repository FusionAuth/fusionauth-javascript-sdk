import { useCallback, useEffect } from 'react';
import { SDKCore } from '@fusionauth-sdk/core';

export function useRedirecting(
  core: SDKCore,
  onRedirect?: (state?: string) => void,
  syncIsLoggedIn?: () => void,
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
    // syncIsLoggedIn runs before onRedirect, but React's setState is
    // async/batched, so this does not guarantee isLoggedIn is already
    // updated by the time onRedirect runs (unlike Vue/Angular's synchronous
    // reactivity).
    core.handlePostRedirect(state => {
      syncIsLoggedIn?.();
      onRedirect?.(state);
    });
  }, [core, onRedirect, syncIsLoggedIn]);

  return {
    manageAccount,
    startLogin,
    startRegister,
    startLogout,
  };
}
