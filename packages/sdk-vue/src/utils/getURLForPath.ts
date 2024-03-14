import { FusionAuthConfig } from '../types';
import querystring from 'query-string';

export const getURLForPath = (
  config: FusionAuthConfig,
  path: string,
  params: Record<string, any> = {},
): string => {
  return querystring.stringifyUrl({
    url: config.serverUrl + path,
    query: params,
  });
};
