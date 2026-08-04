import { Ref, ref } from 'vue';
import { SDKCore } from '@fusionauth-sdk/core';
import { FusionAuth, FusionAuthConfig, UserInfo } from '#/types';

import { NuxtUseCookieAdapter } from './NuxtUseCookieAdapter';

export const createFusionAuth = <T = UserInfo>(
  config: FusionAuthConfig,
): FusionAuth<T> => {
  let cookieAdapter;
  if (config.nuxtUseCookie) {
    cookieAdapter = new NuxtUseCookieAdapter(config.nuxtUseCookie);
  }

  const core = new SDKCore({
    ...config,
    cookieAdapter,
    onTokenExpiration: () => {
      isLoggedIn.value = false;
    },
  });

  const isLoggedIn = ref<boolean>(core.isLoggedIn);
  const userInfo: Ref<T | null> = ref(null);
  const isGettingUserInfo = ref<boolean>(false);
  const error = ref<Error | null>(null);

  async function getUserInfo() {
    isGettingUserInfo.value = true;
    error.value = null;

    try {
      userInfo.value = await core.fetchUserInfo<T>();
      return userInfo.value;
    } catch (e) {
      error.value = e as Error;
    } finally {
      isGettingUserInfo.value = false;
    }
  }

  async function refreshToken() {
    const response = await core.refreshToken();
    syncIsLoggedIn();
    return response;
  }

  function initAutoRefresh() {
    return core.initAutoRefresh();
  }

  function login(state?: string) {
    core.startLogin(state);
  }

  function register(state?: string) {
    core.startRegister(state);
  }

  function logout() {
    core.startLogout();
  }

  function manageAccount() {
    core.manageAccount();
  }

  async function dpopFetch(input: RequestInfo | URL, init?: RequestInit) {
    return core.dpopFetch(input, init);
  }

  async function generateProof(
    htu: string,
    htm: string,
    accessToken?: string,
    nonce?: string,
  ) {
    return core.generateProof(htu, htm, accessToken, nonce);
  }

  function getAccessToken() {
    return core.getAccessToken();
  }

  let didAttemptAutoFetch = false;

  function syncIsLoggedIn() {
    isLoggedIn.value = core.isLoggedIn;
  }

  function maybeAutoFetchUserInfo() {
    if (
      !config.shouldAutoFetchUserInfo ||
      didAttemptAutoFetch ||
      !core.isLoggedIn
    ) {
      return;
    }

    // ensures this does not run multiple times if we fail to fetch the user
    didAttemptAutoFetch = true;
    getUserInfo();
  }

  maybeAutoFetchUserInfo();

  if (config.shouldAutoRefresh && core.isLoggedIn === true) {
    core.initAutoRefresh();
  }

  core.handlePostRedirect(state => {
    syncIsLoggedIn();
    maybeAutoFetchUserInfo();
    config.onRedirect?.(state);
  });

  return {
    isLoggedIn,
    userInfo,
    getUserInfo,
    isGettingUserInfo,
    error,
    login,
    register,
    logout,
    manageAccount,
    refreshToken,
    initAutoRefresh,
    dpopFetch: config.useDpop ? dpopFetch : undefined,
    generateProof: config.useDpop ? generateProof : undefined,
    getAccessToken: config.useDpop ? getAccessToken : undefined,
  };
};
