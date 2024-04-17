import { ReactNode } from 'react';
import { screen, render } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Unauthenticated } from '#components/ui/Unauthenticated';
import { FusionAuthContext } from '#components/providers/Context';
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

describe('Unauthenticated component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const contentForTheUnauthenticated = 'For unauthenticated eyes only';

  test('Renders children if unauthenticated', () => {
    renderWithMockProvider({
      context: { isLoggedIn: false },
      content: (
        <Unauthenticated>
          <p>{contentForTheUnauthenticated}</p>
        </Unauthenticated>
      ),
    });

    screen.getByText(contentForTheUnauthenticated);
  });

  test('Does not render children if authenticated', () => {
    renderWithMockProvider({
      context: { isLoggedIn: true },
      content: (
        <Unauthenticated>
          <p>{contentForTheUnauthenticated}</p>
        </Unauthenticated>
      ),
    });

    expect(screen.queryByText(contentForTheUnauthenticated)).toBeNull();
  });
});
