[@fusionauth/angular-sdk](../README.md) / [Exports](../modules.md) / FusionAuthConfig

# Interface: FusionAuthConfig

Config for FusionAuth Angular SDK

## Table of contents

### Properties

- [autoRefreshSecondsBeforeExpiry](FusionAuthConfig.md#autorefreshsecondsbeforeexpiry)
- [clientId](FusionAuthConfig.md#clientid)
- [loginPath](FusionAuthConfig.md#loginpath)
- [logoutPath](FusionAuthConfig.md#logoutpath)
- [mePath](FusionAuthConfig.md#mepath)
- [onAutoRefreshFailure](FusionAuthConfig.md#onautorefreshfailure)
- [onRedirect](FusionAuthConfig.md#onredirect)
- [postLogoutRedirectUri](FusionAuthConfig.md#postlogoutredirecturi)
- [redirectUri](FusionAuthConfig.md#redirecturi)
- [registerPath](FusionAuthConfig.md#registerpath)
- [scope](FusionAuthConfig.md#scope)
- [serverUrl](FusionAuthConfig.md#serverurl)
- [shouldAutoRefresh](FusionAuthConfig.md#shouldautorefresh)
- [tokenRefreshPath](FusionAuthConfig.md#tokenrefreshpath)

## Properties

### autoRefreshSecondsBeforeExpiry

• `Optional` **autoRefreshSecondsBeforeExpiry**: `number`

The number of seconds before the access token expiry when the auto refresh functionality kicks in if enabled. Default is 10.

#### Defined in

[lib/types.ts:38](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L38)

---

### clientId

• **clientId**: `string`

The client id of the application.

#### Defined in

[lib/types.ts:13](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L13)

---

### loginPath

• `Optional` **loginPath**: `string`

The path to the login endpoint.

#### Defined in

[lib/types.ts:53](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L53)

---

### logoutPath

• `Optional` **logoutPath**: `string`

The path to the logout endpoint.

#### Defined in

[lib/types.ts:63](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L63)

---

### mePath

• `Optional` **mePath**: `string`

The path to the me endpoint.

#### Defined in

[lib/types.ts:73](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L73)

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

[lib/types.ts:48](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L48)

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

[lib/types.ts:43](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L43)

---

### postLogoutRedirectUri

• `Optional` **postLogoutRedirectUri**: `string`

The redirect URI for post-logout. Defaults the provided `redirectUri`.

#### Defined in

[lib/types.ts:23](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L23)

---

### redirectUri

• **redirectUri**: `string`

The redirect URI of the application.

#### Defined in

[lib/types.ts:18](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L18)

---

### registerPath

• `Optional` **registerPath**: `string`

The path to the register endpoint.

#### Defined in

[lib/types.ts:58](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L58)

---

### scope

• `Optional` **scope**: `string`

The OAuth2 scope parameter passed to the `/oauth2/authorize` endpoint. If not specified fusionauth will default this to `openid offline_access`.

#### Defined in

[lib/types.ts:28](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L28)

---

### serverUrl

• **serverUrl**: `string`

The URL of the server that performs the token exchange.

#### Defined in

[lib/types.ts:8](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L8)

---

### shouldAutoRefresh

• `Optional` **shouldAutoRefresh**: `boolean`

Enables automatic token refreshing. Defaults to false.

#### Defined in

[lib/types.ts:33](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L33)

---

### tokenRefreshPath

• `Optional` **tokenRefreshPath**: `string`

The path to the token refresh endpoint.

#### Defined in

[lib/types.ts:68](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/577b2095f8d4b995dc5a020ced655b8e2d042a3a/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L68)
