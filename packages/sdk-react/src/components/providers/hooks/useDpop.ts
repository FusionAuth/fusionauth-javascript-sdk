import { useCallback } from 'react';
import { SDKCore } from '@fusionauth-sdk/core';

/**
 * Exposes `dpopFetch`, `generateProof`, and `getAccessToken` from `core`
 * when DPoP mode is enabled. Each is `undefined` when `useDpop` is falsy,
 * matching `FusionAuthProviderContext`'s optional fields.
 */
export function useDpop(core: SDKCore, enabled: boolean) {
  const dpopFetch = useCallback(
    (input: RequestInfo | URL, init?: RequestInit) =>
      core.dpopFetch(input, init),
    [core],
  );

  const generateProof = useCallback(
    (htu: string, htm: string, accessToken?: string, nonce?: string) =>
      core.generateProof(htu, htm, accessToken, nonce),
    [core],
  );

  const getAccessToken = useCallback(() => core.getAccessToken(), [core]);

  if (!enabled) {
    return {
      dpopFetch: undefined,
      generateProof: undefined,
      getAccessToken: undefined,
    };
  }

  return { dpopFetch, generateProof, getAccessToken };
}
