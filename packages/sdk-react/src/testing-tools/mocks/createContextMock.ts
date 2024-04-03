import { IFusionAuthContext } from '../../components/providers/FusionAuthProvider';
import { vi } from 'vitest';

export const createContextMock = (
  context: Partial<IFusionAuthContext>,
): IFusionAuthContext => ({
  login: context.login ?? vi.fn(),
  logout: context.logout ?? vi.fn(),
  register: context.register ?? vi.fn(),
  isAuthenticated: context.isAuthenticated ?? false,
  user: context.user ?? {},
  refreshToken: context.refreshToken ?? vi.fn(),
  initAutoTokenRefresh: context.initAutoTokenRefresh ?? vi.fn(),
  isLoading: context.isLoading ?? false,
});
