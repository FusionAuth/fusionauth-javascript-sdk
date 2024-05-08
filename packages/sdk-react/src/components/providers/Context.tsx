import React from 'react';
import { FusionAuthProviderContext } from './FusionAuthProviderContext';

export const defaultContext: FusionAuthProviderContext = {
  startLogin: () => {},
  startLogout: () => {},
  startRegister: () => {},
  userInfo: null,
  fetchUserInfo: () => Promise.resolve({}),
  isFetchingUserInfo: false,
  error: null,
  isLoggedIn: false,
  refreshToken: () => Promise.resolve(undefined),
  initAutoRefresh: () => {},
};

export type UserInfo = {
  applicationId?: string;
  email?: string;
  email_verified?: boolean;
  family_name?: string;
  given_name?: string;
  picture?: string;
  roles?: any[];
  sid?: string;
  sub?: string;
  tid?: string;
  phone_number?: string;
};

export const FusionAuthContext =
  React.createContext<FusionAuthProviderContext>(defaultContext);
