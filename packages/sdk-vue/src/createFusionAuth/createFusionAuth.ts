import { ref } from 'vue';
import { SDKCore } from '@fusionauth-sdk/core';
import { FusionAuth, FusionAuthConfig, UserInfo } from '#/types';

export const createFusionAuth = (config: FusionAuthConfig): FusionAuth => {
  const core = new SDKCore({
    ...config,
    onTokenExpiration: () => {
      isLoggedIn.value = false;
    },
  });

  const isLoggedIn = ref<boolean>(core.isLoggedIn);
  const userInfo = ref<UserInfo | null>(null);
  const isGettingUserInfo = ref<boolean>(false);
  const error = ref<Error | null>(null);

  async function getUserInfo() {
    isGettingUserInfo.value = true;
    error.value = null;

    try {
      userInfo.value = await core.fetchUserInfo();
      return userInfo.value;
    } catch (e) {
      error.value = e as Error;
    } finally {
      isGettingUserInfo.value = false;
    }
  }

  async function refreshToken() {
    return await core.refreshToken();
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

  if (config.shouldAutoFetchUserInfo && core.isLoggedIn === true) {
    getUserInfo();
  }

  if (config.shouldAutoRefresh && core.isLoggedIn === true) {
    core.initAutoRefresh();
  }

  core.handlePostRedirect(config.onRedirect);

  return {
    isLoggedIn,
    userInfo,
    getUserInfo,
    isGettingUserInfo,
    error,
    login,
    register,
    logout,
    refreshToken,
    initAutoRefresh: core.initAutoRefresh,
  };
};
