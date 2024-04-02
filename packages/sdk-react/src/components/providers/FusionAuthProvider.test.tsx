import { PropsWithChildren } from 'react';
import { waitFor, renderHook } from '@testing-library/react';
import { describe, afterEach, test, expect, beforeEach, vi } from 'vitest';

import {
  FusionAuthProvider,
  useFusionAuth,
} from '#/components/providers/FusionAuthProvider';
import { mockCrypto } from '#/testing-tools/mocks/mockCrypto';
import { mockFetchJson } from '#/testing-tools/mocks/mockFetchJson';
import { TEST_CONFIG } from '#testing-tools/mocks/testConfig';

let location: Location;

describe('FusionAuthProvider', () => {
  beforeEach(() => {
    location = window.location;
    vi.spyOn(window, 'location', 'get').mockRestore();

    mockCrypto();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Login function will navigate to the correct url', () => {
    const mockedLocation = {
      ...location,
      assign: vi.fn(),
    };
    vi.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

    const wrapper = ({ children }: PropsWithChildren) => (
      <FusionAuthProvider {...TEST_CONFIG}>{children}</FusionAuthProvider>
    );
    const { result } = renderHook(() => useFusionAuth(), {
      wrapper,
    });

    const stateValue = 'state-value';
    result.current.login(stateValue);

    const expectedUrl = new URL(TEST_CONFIG.serverUrl);
    expectedUrl.pathname = '/app/login';
    expectedUrl.searchParams.set('client_id', TEST_CONFIG.clientID);
    expectedUrl.searchParams.set('redirect_uri', TEST_CONFIG.redirectUri);
    expectedUrl.searchParams.set('scope', 'openid offline_access');
    expectedUrl.searchParams.set('state', stateValue);

    expect(mockedLocation.assign).toHaveBeenCalledWith(expectedUrl);
  });

  test('User set to the value stored in the cookie', () => {
    const trent = { name: 'trent anderson' };
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: `user=${JSON.stringify(trent)}`,
    });

    const wrapper = ({ children }: PropsWithChildren) => (
      <FusionAuthProvider {...TEST_CONFIG}>{children}</FusionAuthProvider>
    );
    const { result } = renderHook(() => useFusionAuth(), {
      wrapper,
    });

    expect(result.current.user).toEqual(trent);
    expect(result.current.isAuthenticated).toBe(true);
  });

  test('Will fetch the user from the server when the id token cookie is set', async () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: `app.idt=12345`,
    });

    const user = { name: 'Mr. Userton' };
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve(user),
    } as Response;
    vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse);

    const serverUrl = 'http://my-server.com';
    const mePath = '/my-me-path';

    const { result } = renderHook(() => useFusionAuth(), {
      wrapper: ({ children }) => (
        <FusionAuthProvider
          {...TEST_CONFIG}
          serverUrl={serverUrl}
          mePath={mePath}
        >
          {children}
        </FusionAuthProvider>
      ),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.user).toEqual({});
    expect(result.current.isAuthenticated).toBe(false);
    expect(fetch).toHaveBeenCalledWith(new URL(serverUrl + mePath), {
      credentials: 'include',
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toEqual(user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  test('User to empty when user cookie is not json parsable', () => {
    const mockedLocation = {
      ...location,
      assign: vi.fn(),
    };
    vi.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'user=undefined',
    });

    const wrapper = ({ children }: PropsWithChildren) => (
      <FusionAuthProvider {...TEST_CONFIG}>{children}</FusionAuthProvider>
    );
    const { result } = renderHook(() => useFusionAuth(), {
      wrapper,
    });

    expect(result.current.user).toEqual({});
    expect(result.current.isAuthenticated).toEqual(false);
  });

  test('Logout function will navigate to the correct url', () => {
    mockFetchJson({});
    const mockedLocation = {
      ...location,
      assign: vi.fn(),
    };
    vi.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

    const wrapper = ({ children }: PropsWithChildren) => (
      <FusionAuthProvider {...TEST_CONFIG}>{children}</FusionAuthProvider>
    );
    const { result } = renderHook(() => useFusionAuth(), {
      wrapper,
    });

    result.current.logout();

    const expectedUrl = new URL(TEST_CONFIG.serverUrl);
    expectedUrl.pathname = '/app/logout';
    expectedUrl.searchParams.set('client_id', TEST_CONFIG.clientID);
    expectedUrl.searchParams.set(
      'post_logout_redirect_uri',
      TEST_CONFIG.redirectUri,
    );

    expect(mockedLocation.assign).toHaveBeenCalledWith(expectedUrl);
  });

  test('Register function will navigate to the correct url', () => {
    const mockedLocation = {
      ...location,
      assign: vi.fn(),
    };
    vi.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);

    const wrapper = ({ children }: PropsWithChildren) => (
      <FusionAuthProvider {...TEST_CONFIG}>{children}</FusionAuthProvider>
    );
    const { result } = renderHook(() => useFusionAuth(), {
      wrapper,
    });
    const stateValue = 'my-state-value';
    result.current.register(stateValue);

    const expectedUrl = new URL(TEST_CONFIG.serverUrl);
    expectedUrl.pathname = '/app/register';
    expectedUrl.searchParams.set('client_id', TEST_CONFIG.clientID);
    expectedUrl.searchParams.set('redirect_uri', TEST_CONFIG.redirectUri);
    expectedUrl.searchParams.set('scope', 'openid offline_access');
    expectedUrl.searchParams.set('state', stateValue);

    expect(mockedLocation.assign).toHaveBeenCalledWith(expectedUrl);
  });

  test('Will invoke the onRedirectFail callback only once', async () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      // lastState should ensure redirect handlers are called
      value: 'lastState=abc123; app.idt=abc123;',
    });

    const redirectFailHandler = vi.fn();

    const errorResponse = {
      ok: false,
      json: () => Promise.resolve({ message: 'something went wrong' }),
    } as Response;
    vi.spyOn(global, 'fetch').mockResolvedValue(errorResponse);

    renderHook(() => useFusionAuth(), {
      wrapper: ({ children }) => (
        <FusionAuthProvider
          {...TEST_CONFIG}
          onRedirectFail={redirectFailHandler}
        >
          {children}
        </FusionAuthProvider>
      ),
    });

    await waitFor(() => {
      expect(redirectFailHandler).toHaveBeenCalledTimes(1);
      expect(redirectFailHandler).toHaveBeenCalled();
      expect(document.cookie).toContain('lastState=;'); // lastState cookie was removed
    });
  });

  test('Will invoke the onRedirectSuccess callback only once', async () => {
    const stateValue = 'some-value';
    Object.defineProperty(document, 'cookie', {
      writable: true,
      // lastState should ensure redirect handlers are called
      value: `lastState=12345:${stateValue}; app.idt=abc123;`,
    });

    const redirectSuccessHandler = vi.fn();
    const response = {
      ok: true,
      json: () => Promise.resolve({ name: 'Johnny' }),
    } as Response;
    vi.spyOn(global, 'fetch').mockResolvedValue(response);

    renderHook(() => useFusionAuth(), {
      wrapper: ({ children }) => (
        <FusionAuthProvider
          {...TEST_CONFIG}
          onRedirectSuccess={redirectSuccessHandler}
        >
          {children}
        </FusionAuthProvider>
      ),
    });

    await waitFor(() => {
      expect(redirectSuccessHandler).toHaveBeenCalledTimes(1);
      expect(redirectSuccessHandler).toHaveBeenCalledWith(stateValue);
      expect(document.cookie).toContain('lastState=;'); // lastState cookie was removed
    });
  });

  test('Will not invoke onRedirectSuccess when lastState cookie is not set', async () => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: `app.idt=abc123;`,
    });

    const redirectSuccessHandler = vi.fn();
    const alan = { name: 'Alan Turing' };
    const response = {
      ok: true,
      json: () => Promise.resolve(alan),
    } as Response;
    vi.spyOn(global, 'fetch').mockResolvedValue(response);

    const { result } = renderHook(() => useFusionAuth(), {
      wrapper: ({ children }) => (
        <FusionAuthProvider
          {...TEST_CONFIG}
          onRedirectSuccess={redirectSuccessHandler}
        >
          {children}
        </FusionAuthProvider>
      ),
    });

    await waitFor(() => {
      expect(result.current.user.name).toBe('Alan Turing'); // user was fetched successfully without invoking redirect handler
      expect(redirectSuccessHandler).not.toHaveBeenCalled();
    });
  });
});
