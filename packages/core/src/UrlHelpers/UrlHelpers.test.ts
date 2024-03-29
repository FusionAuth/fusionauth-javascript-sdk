import { describe, it, expect } from 'vitest';

import { UrlGenerationConfig, UrlHelpers } from 'src/UrlHelpers';

describe('UrlHelpers.generateUrl', () => {
  it('Should generate a url correctly based on configuration', () => {
    const config: UrlGenerationConfig = {
      serverUrlString: 'http://my-server',
      path: '/my-path',
      clientId: 'abc123',
      params: {
        redirectUri: 'http://my-client',
        state: 'my-state',
      },
    };
    const url = UrlHelpers.generateUrl(config);
    expect(url.href).toBe(
      'http://my-server/my-path/abc123?redirectUri=http%3A%2F%2Fmy-client&state=my-state',
    );
  });
});
