import { vi } from 'vitest';

import * as FusionAuthProvider from '#/components/providers/FusionAuthProvider';
import { FusionAuthProviderContext } from '#/components/providers/FusionAuthProviderContext';

import { createContextMock } from './createContextMock';

export const mockUseFusionAuth = (
  context: Partial<FusionAuthProviderContext> = {},
) => {
  const contextMock: FusionAuthProviderContext = createContextMock(context);
  return vi
    .spyOn(FusionAuthProvider, 'useFusionAuth')
    .mockReturnValue(contextMock);
};
