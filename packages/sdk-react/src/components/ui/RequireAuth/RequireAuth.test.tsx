import { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { RequireAuth } from './';
import { FusionAuthContext } from '#/components/providers/Context';
import { FusionAuthProviderContext } from '#/components/providers/FusionAuthProviderContext';

import { createContextMock } from '#/testing-tools/mocks/createContextMock';

const renderWithMockProvider = ({
  context,
  content,
}: {
  context: Partial<FusionAuthProviderContext>;
  content: ReactNode;
}) => {
  return render(
    <FusionAuthContext.Provider value={createContextMock(context)}>
      {content}
    </FusionAuthContext.Provider>,
  );
};

describe('RequireAuth Component', () => {
  test('Will render children when userInfo has the required role', () => {
    const protectedContent = 'Admin Content';
    const requiredRole = 'ADMIN';

    renderWithMockProvider({
      context: {
        isLoggedIn: true,
        userInfo: {
          roles: [requiredRole],
        },
      },
      content: (
        <RequireAuth withRole={requiredRole}>
          <h1>{protectedContent}</h1>
        </RequireAuth>
      ),
    });

    expect(screen.queryByText(protectedContent)).toBeInTheDocument();
  });

  test('Will not render children without the specified role', () => {
    const protectedContent = 'Admin Content';

    renderWithMockProvider({
      context: {
        isLoggedIn: true,
        userInfo: {
          roles: ['USER'],
        },
      },
      content: (
        <RequireAuth withRole={'ADMIN'}>
          <h1>{protectedContent}</h1>
        </RequireAuth>
      ),
    });

    expect(screen.queryByText(protectedContent)).not.toBeInTheDocument();
  });
});
