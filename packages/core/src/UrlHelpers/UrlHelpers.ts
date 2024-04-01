export type UrlGenerationConfig = {
  serverUrlString: string;
  path: string;
  clientId: string;
  params?: UrlGenerationParams;
};

type UrlGenerationParams = {
  redirectUri: string;
  state?: string;
  scope?: string;
};

export class UrlHelpers {
  /** Generates a URL configured with clientId and search params. */
  static generateUrl(config: UrlGenerationConfig): URL {
    const url = new URL(config.serverUrlString);
    url.pathname = `${config.path}/${config.clientId}`;

    if (config.params) {
      const urlSearchParams = _generateURLSearchParams(config.params);
      url.search = urlSearchParams.toString();
    }

    return url;
  }
}

function _generateURLSearchParams(
  params: UrlGenerationParams,
): URLSearchParams {
  const urlSearchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      urlSearchParams.append(key, value);
    }
  });

  return urlSearchParams;
}
