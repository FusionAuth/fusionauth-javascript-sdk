[@fusionauth/angular-sdk](../README.md) / [Exports](../modules.md) / FusionAuthConfig

# Interface: FusionAuthConfig

Config for FusionAuth Angular SDK

## Table of contents

### Properties

- [authParams](FusionAuthConfig.md#authparams)
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

### authParams

• `Optional` **authParams**: \{ `[key: string]`: `any`;  }[]

Params to be appended to the authorize request.

#### Defined in

[lib/types.ts:78](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L78)

___

### autoRefreshSecondsBeforeExpiry

• `Optional` **autoRefreshSecondsBeforeExpiry**: `number`

The number of seconds before the access token expiry when the auto refresh functionality kicks in if enabled. Default is 10.

#### Defined in

[lib/types.ts:38](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L38)

___

### clientId

• **clientId**: `string`

The client id of the application.

#### Defined in

[lib/types.ts:13](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L13)

___

### loginPath

• `Optional` **loginPath**: `string`

The path to the login endpoint.

#### Defined in

[lib/types.ts:53](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L53)

___

### logoutPath

• `Optional` **logoutPath**: `string`

The path to the logout endpoint.

#### Defined in

[lib/types.ts:63](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L63)

___

### mePath

• `Optional` **mePath**: `string`

The path to the me endpoint.

#### Defined in

[lib/types.ts:73](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L73)

___

### onAutoRefreshFailure

• `Optional` **onAutoRefreshFailure**: (`error`: `Error`) => `void`

Callback to be invoked if a request to refresh the access token fails during autorefresh.

#### Type declaration

▸ (`error`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `Error` |

##### Returns

`void`

#### Defined in

[lib/types.ts:48](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L48)

___

### onRedirect

• `Optional` **onRedirect**: (`state?`: `string`) => `void`

Callback function to be invoked with the `state` value upon redirect from login or register.

#### Type declaration

▸ (`state?`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `state?` | `string` |

##### Returns

`void`

#### Defined in

[lib/types.ts:43](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L43)

___

### postLogoutRedirectUri

• `Optional` **postLogoutRedirectUri**: `string`

The redirect URI for post-logout. Defaults the provided `redirectUri`.

#### Defined in

[lib/types.ts:23](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L23)

___

### redirectUri

• **redirectUri**: `string`

The redirect URI of the application.

#### Defined in

[lib/types.ts:18](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L18)

___

### registerPath

• `Optional` **registerPath**: `string`

The path to the register endpoint.

#### Defined in

[lib/types.ts:58](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L58)

___

### scope

• `Optional` **scope**: `string`

The OAuth2 scope parameter passed to the `/oauth2/authorize` endpoint. If not specified fusionauth will default this to `openid offline_access`.

#### Defined in

[lib/types.ts:28](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L28)

___

### serverUrl

• **serverUrl**: `string`

The URL of the server that performs the token exchange.

#### Defined in

[lib/types.ts:8](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L8)

___

### shouldAutoRefresh

• `Optional` **shouldAutoRefresh**: `boolean`

Enables automatic token refreshing. Defaults to false.

#### Defined in

[lib/types.ts:33](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L33)

___

### tokenRefreshPath

• `Optional` **tokenRefreshPath**: `string`

The path to the token refresh endpoint.

#### Defined in

[lib/types.ts:68](https://github.com/getabetterpic/fusionauth-javascript-sdk/blob/6caa06a6b24710315cf53a4507c3fcff90aee5cd/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L68)
