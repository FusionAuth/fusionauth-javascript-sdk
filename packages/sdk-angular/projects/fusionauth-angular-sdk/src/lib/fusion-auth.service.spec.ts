import { UserInfo } from './types';
import { FusionAuthConfig } from './types';
import { FusionAuthService } from './fusion-auth.service';

describe('FusionAuthService', () => {
  let service: FusionAuthService;
  const config: FusionAuthConfig = {
    clientId: 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e',
    loginPath: '/app/login',
    redirectUri: 'http://my-app.com',
    serverUrl: 'http://localhost:9011',
  };

  beforeEach(() => {
    service = new FusionAuthService(config);
  });

  it('should get user info', async () => {
    const userInfo: UserInfo = {
      email: 'richard@test.com',
    };

    spyOn(window, 'fetch').and.resolveTo({
      text: () => Promise.resolve(JSON.stringify(userInfo)),
    } as Response);

    const fetchedUserInfo = await service.getUserInfo();
    expect(fetchedUserInfo).toEqual(userInfo);
  });
});
