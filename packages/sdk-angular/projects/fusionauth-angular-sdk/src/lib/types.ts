export interface FusionAuthConfig {
  serverUrl: string;
  clientId: string;
  redirectUri?: string;

  /** The number of seconds before the access token expiry when the auto refresh functionality kicks in if enabled. Default is 10. */
  autoRefreshSecondsBeforeExpiry?: number;
  /** Enables automatic token refreshing. Defaults to false. */
  shouldAutoRefresh?: boolean;
  loginPath?: string;
  logoutPath?: string;
  registerPath?: string;
  tokenRefreshPath?: string;
  mePath?: string;
}

export interface UserInfo {
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
}
