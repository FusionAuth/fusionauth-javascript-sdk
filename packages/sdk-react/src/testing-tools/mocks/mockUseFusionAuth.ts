import * as FusionAuthProvider from '../../components/providers/FusionAuthProvider';
import { IFusionAuthContext } from '../../components/providers/FusionAuthProvider';
import { createContextMock } from './createContextMock';
import { vi } from 'vitest';

export const mockUseFusionAuth = (
  context: Partial<IFusionAuthContext> = {},
) => {
  const contextMock = createContextMock(context);
  return vi
    .spyOn(FusionAuthProvider, 'useFusionAuth')
    .mockReturnValue(contextMock);
};
