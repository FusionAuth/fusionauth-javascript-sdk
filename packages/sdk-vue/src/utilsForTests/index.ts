import { InjectionKey, ref } from 'vue';
import { vi } from 'vitest';

import type { FusionAuth } from '..';

import { fusionAuthKey } from '../injectionSymbols';

export const getMockFusionAuth = ({
  login = vi.fn(),
  logout = vi.fn(),
  register = vi.fn(),
  isLoggedIn = ref(false),
  userInfo = ref(null),
}: Partial<FusionAuth>) => {
  return {
    key: fusionAuthKey as InjectionKey<FusionAuth>,
    mockedValues: {
      login,
      logout,
      register,
      isLoggedIn,
      userInfo,
    },
  };
};
