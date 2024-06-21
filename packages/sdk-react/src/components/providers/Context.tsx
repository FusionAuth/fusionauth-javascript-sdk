import React from 'react';
import { FusionAuthProviderContext } from './FusionAuthProviderContext';

export const defaultContext: FusionAuthProviderContext = {
  startLogin: () => {},
  startLogout: () => {},
  startRegister: () => {},
  manageAccount: () => {},
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
  birthdate?: string;
  email?: string;
  email_verified?: boolean;
  family_name?: string;
  given_name?: string;
  name?: string;
  middle_name?: string;
  phone_number?: string;
  picture?: string;
  preferred_username?: string;
  roles?: any[];
  sid?: string;
  sub?: string;
  tid?: string;
};

export const FusionAuthContext =
  React.createContext<FusionAuthProviderContext<UserInfo | any>>(
    defaultContext,
  );
