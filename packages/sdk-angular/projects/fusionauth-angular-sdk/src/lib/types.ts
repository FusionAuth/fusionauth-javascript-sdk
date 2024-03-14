export interface FusionAuthConfig {
  serverUrl: string;
  clientId: string;
  redirectUri?: string;

  autoRefreshSecondsBeforeExpiry?: number;
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
