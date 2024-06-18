import { FusionAuthProviderContext } from '#/components/providers/FusionAuthProviderContext';
import { vi } from 'vitest';

export const createContextMock = (
  context: Partial<FusionAuthProviderContext>,
): FusionAuthProviderContext => ({
  startLogin: context.startLogin ?? vi.fn(),
  startLogout: context.startLogout ?? vi.fn(),
  startRegister: context.startRegister ?? vi.fn(),
  isLoggedIn: context.isLoggedIn ?? false,
  userInfo: context.userInfo ?? null,
  refreshToken: context.refreshToken ?? vi.fn(),
  initAutoRefresh: context.initAutoRefresh ?? vi.fn(),
  manageAccount: context.manageAccount ?? vi.fn(),
  isFetchingUserInfo: context.isFetchingUserInfo ?? false,
  error: context.error ?? null,
  fetchUserInfo:
    context.fetchUserInfo ??
    function () {
      return Promise.resolve({});
    },
});
