import { FusionAuthConfig } from '../types';
import { getURLForPath } from './getURLForPath';

export const doRedirectForPath = (
  config: FusionAuthConfig,
  path: string,
  params: Record<string, any> = {},
) => {
  if (config.redirectUri) {
    params['redirect_uri'] = config.redirectUri;
  }
  window.location.assign(
    getURLForPath(config, path + '/' + config.clientId, params),
  );
};
