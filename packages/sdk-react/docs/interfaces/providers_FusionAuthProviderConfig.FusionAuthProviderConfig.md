[@fusionauth/react-sdk](../README.md) / [Modules](../modules.md) / [providers/FusionAuthProviderConfig](../modules/providers_FusionAuthProviderConfig.md) / FusionAuthProviderConfig

# Interface: FusionAuthProviderConfig

[providers/FusionAuthProviderConfig](../modules/providers_FusionAuthProviderConfig.md).FusionAuthProviderConfig

Config for FusionAuthProvider

## Table of contents

### Properties

- [accessTokenExpireCookieName](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#accesstokenexpirecookiename)
- [autoRefreshSecondsBeforeExpiry](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#autorefreshsecondsbeforeexpiry)
- [clientId](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#clientid)
- [loginPath](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#loginpath)
- [logoutPath](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#logoutpath)
- [mePath](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#mepath)
- [nextCookieAdapter](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#nextcookieadapter)
- [onAutoRefreshFailure](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#onautorefreshfailure)
- [onRedirect](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#onredirect)
- [postLogoutRedirectUri](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#postlogoutredirecturi)
- [redirectUri](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#redirecturi)
- [registerPath](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#registerpath)
- [scope](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#scope)
- [serverUrl](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#serverurl)
- [shouldAutoFetchUserInfo](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#shouldautofetchuserinfo)
- [shouldAutoRefresh](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#shouldautorefresh)
- [tokenRefreshPath](providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md#tokenrefreshpath)

## Properties

### accessTokenExpireCookieName

• `Optional` **accessTokenExpireCookieName**: `string`

The name of the access token expiration moment cookie.
Only set this if you are hosting server that uses a custom name for the 'app.at_exp' cookie.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:93](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L93)

---

### autoRefreshSecondsBeforeExpiry

• `Optional` **autoRefreshSecondsBeforeExpiry**: `number`

The number of seconds before the access token expiry when the auto refresh functionality kicks in if enabled. Default is 10.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:45](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L45)

---

### clientId

• **clientId**: `string`

The client id of the application.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:15](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L15)

---

### loginPath

• `Optional` **loginPath**: `string`

The path to the login endpoint.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:60](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L60)

---

### logoutPath

• `Optional` **logoutPath**: `string`

The path to the logout endpoint.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:70](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L70)

---

### mePath

• `Optional` **mePath**: `string`

The path to the me endpoint.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:87](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L87)

---

### nextCookieAdapter

• `Optional` **nextCookieAdapter**: () => `Cookies`

Pass in `useCookies` from [next-client-cookies](https://github.com/moshest/next-client-cookies).
This is needed for the React SDK to support Next/SSR.
See docs for [configuration with nextjs](https://github.com/FusionAuth/fusionauth-javascript-sdk/tree/main/packages/sdk-react#configuration-with-nextjs) for more information.

#### Type declaration

▸ (): `Cookies`

##### Returns

`Cookies`

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:82](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L82)

---

### onAutoRefreshFailure

• `Optional` **onAutoRefreshFailure**: (`error`: `Error`) => `void`

Callback to be invoked if a request to refresh the access token fails during autorefresh.

#### Type declaration

▸ (`error`): `void`

##### Parameters

| Name    | Type    |
| :------ | :------ |
| `error` | `Error` |

##### Returns

`void`

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:55](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L55)

---

### onRedirect

• `Optional` **onRedirect**: (`state?`: `string`) => `void`

Callback function to be invoked with the `state` value upon redirect from login or register.

#### Type declaration

▸ (`state?`): `void`

##### Parameters

| Name     | Type     |
| :------- | :------- |
| `state?` | `string` |

##### Returns

`void`

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:50](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L50)

---

### postLogoutRedirectUri

• `Optional` **postLogoutRedirectUri**: `string`

The redirect URI for post-logout. Defaults the provided `redirectUri`.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:30](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L30)

---

### redirectUri

• **redirectUri**: `string`

The redirect URI of the application.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:20](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L20)

---

### registerPath

• `Optional` **registerPath**: `string`

The path to the register endpoint.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:65](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L65)

---

### scope

• `Optional` **scope**: `string`

The OAuth2 scope parameter passed to the `/oauth2/authorize` endpoint. If not specified fusionauth will default this to `openid offline_access`.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:25](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L25)

---

### serverUrl

• **serverUrl**: `string`

The URL of the server that performs the token exchange.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:10](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L10)

---

### shouldAutoFetchUserInfo

• `Optional` **shouldAutoFetchUserInfo**: `boolean`

Enables the SDK to automatically handle fetching user info when logged in. Defaults to false.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:40](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L40)

---

### shouldAutoRefresh

• `Optional` **shouldAutoRefresh**: `boolean`

Enables automatic token refreshing. Defaults to false.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:35](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L35)

---

### tokenRefreshPath

• `Optional` **tokenRefreshPath**: `string`

The path to the token refresh endpoint.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:75](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L75)
