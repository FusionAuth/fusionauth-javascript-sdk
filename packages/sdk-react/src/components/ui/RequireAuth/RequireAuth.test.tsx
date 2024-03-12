import { ReactNode } from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';

import { RequireAuth } from './';
import {
  FusionAuthContext,
  FusionAuthProvider,
  IFusionAuthContext,
} from '#components/providers/FusionAuthProvider';
import { FusionAuthLogoutButton } from '#components/ui/FusionAuthLogoutButton';
import {
  TEST_REDIRECT_URL,
  TEST_CONFIG,
} from '#testing-tools/mocks/testConfig';
import { mockCrypto } from '#testing-tools/mocks/mockCrypto';
import { mockFetchJson } from '#testing-tools/mocks/mockFetchJson';

let location: Location;
describe('RequireAuth Component', () => {
  beforeEach(() => {
    location = window.location;
    vi.spyOn(window, 'location', 'get').mockRestore();

    mockCrypto();
    mockFetchJson({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('RequireAuth Component does not render children when no user is present and no role is passed', () => {
    renderWithContext({
      context: {
        isAuthenticated: false,
        user: {},
      },
      content: (
        <RequireAuth withRole={undefined}>
          <h1>Hello</h1>
        </RequireAuth>
      ),
    });
    expect(screen.queryByText('Hello')).toBeNull();
  });

  test('RequireAuth Component does not render children when user is not present', () => {
    renderWithContext({
      context: {
        user: {},
      },
      content: (
        <RequireAuth withRole={'admin'}>
          <h1>Hello</h1>
        </RequireAuth>
      ),
    });
    expect(screen.queryByText('Hello')).toBeNull();
  });

  test('RequireAuth Component renders children when user is present with one of the roles', () => {
    const protectedContent = 'Hello world';

    renderWithContext({
      context: {
        user: {
          roles: ['admin', 'super-admin'],
        },
      },
      content: (
        <RequireAuth withRole={'admin'}>
          <h1>{protectedContent}</h1>
        </RequireAuth>
      ),
    });

    expect(screen.queryByText(protectedContent)).toBeInTheDocument();
  });

  test('RequireAuth Component does not render children when user is present with the incorrect role', async () => {
    const protectedContent = 'Only for admins';

    renderWithContext({
      context: {
        user: {
          roles: ['non-admin'],
        },
      },
      content: (
        <RequireAuth withRole={'admin'}>
          <h1>{protectedContent}</h1>
        </RequireAuth>
      ),
    });

    expect(screen.queryByText(protectedContent)).toBeNull();
  });

  test('RequireAuth Component renders children when user is present and no role is passed', () => {
    renderWithContext({
      context: {
        isAuthenticated: true,
        user: {
          roles: ['non-admin'],
        },
      },
      content: (
        <RequireAuth withRole={undefined}>
          <h1>Hello</h1>
        </RequireAuth>
      ),
    });

    expect(screen.queryByText('Hello')).toBeInTheDocument();
  });

  test('RequireAuth Component does not render children when CSRF check fails', async () => {
    const mockedLocation = {
      ...location,
      assign: vi.fn(),
      search: TEST_REDIRECT_URL,
    };
    vi.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);
    mockFetchJson({ roles: ['admin'] });

    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'lastState=1111; ',
    });

    await renderProvider();

    expect(await screen.queryByText('Logout')).toBeNull();
  });
});

const renderProvider = (role?: string) => {
  return waitFor(() =>
    render(
      <FusionAuthProvider {...TEST_CONFIG}>
        <RequireAuth withRole={role}>
          <FusionAuthLogoutButton />
        </RequireAuth>
      </FusionAuthProvider>,
    ),
  );
};

const renderWithContext = ({
  context,
  content,
}: {
  context: Partial<IFusionAuthContext>;
  content: ReactNode;
}) => {
  // mock fusion auth context
  const providerValue: IFusionAuthContext = {
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    register: () => Promise.resolve(),
    user: {},
    isLoading: false,
    isAuthenticated: true,
    refreshToken: () => Promise.resolve(),
    ...context,
  };

  return render(
    <FusionAuthContext.Provider value={providerValue}>
      {content}
    </FusionAuthContext.Provider>,
  );
};
