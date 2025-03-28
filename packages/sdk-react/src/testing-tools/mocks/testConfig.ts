import { FusionAuthProviderConfig } from '#/components/providers/FusionAuthProviderConfig';

export const TEST_CONFIG: FusionAuthProviderConfig = {
  clientId: '85a03867-dccf-4882-adde-1a79aeec50df',
  serverUrl: 'http://localhost:9000',
  redirectUri: 'http://localhost',
  scope: 'openid email profile offline_access',
  postLogoutRedirectUri: 'http://localhost',
};

export const TEST_AUTHPARAM_CONFIG: FusionAuthProviderConfig = {
  clientId: '85a03867-dccf-4882-adde-1a79aeec50df',
  serverUrl: 'http://localhost:9000',
  redirectUri: 'http://localhost',
  scope: 'openid email profile offline_access',
  authParams: [{ idp_hint: '44449786-3dff-42a6-aac6-1f1ceecb6c46' }],
  postLogoutRedirectUri: 'http://localhost',
};
