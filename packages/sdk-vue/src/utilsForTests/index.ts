import { vi } from 'vitest';

import type { FusionAuth } from '..';

import { fusionAuthKey } from '../injectionSymbols';

export const getMockFusionAuth = ({
  login = vi.fn(),
  logout = vi.fn(),
  register = vi.fn(),
}: Partial<FusionAuth>) => {
  return {
    key: fusionAuthKey as symbol,
    mockedValues: {
      login,
      logout,
      register,
    },
  };
};
