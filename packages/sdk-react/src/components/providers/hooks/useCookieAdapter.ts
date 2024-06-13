import { useMemo } from 'react';

import { CookieAdapter } from '@fusionauth-sdk/core';

import { FusionAuthProviderConfig } from '../FusionAuthProviderConfig';

export function useCookieAdapter(config: FusionAuthProviderConfig) {
  const cookies = config.nextCookieAdapter?.();
  const cookieName = config.accessTokenExpireCookieName ?? 'app.at_exp';

  return useMemo<CookieAdapter | undefined>(
    () =>
      cookies
        ? {
            at_exp() {
              return cookies.get(cookieName);
            },
          }
        : undefined,
    [cookies, cookieName],
  );
}
