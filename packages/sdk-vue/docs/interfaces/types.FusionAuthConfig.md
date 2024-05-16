[@fusionauth/vue-sdk](../README.md) / [Modules](../modules.md) / [types](../modules/types.md) / FusionAuthConfig

# Interface: FusionAuthConfig

[types](../modules/types.md).FusionAuthConfig

Config for the FusionAuth Vue SDK

## Table of contents

### Properties

- [autoRefreshSecondsBeforeExpiry](types.FusionAuthConfig.md#autorefreshsecondsbeforeexpiry)
- [clientId](types.FusionAuthConfig.md#clientid)
- [loginPath](types.FusionAuthConfig.md#loginpath)
- [logoutPath](types.FusionAuthConfig.md#logoutpath)
- [mePath](types.FusionAuthConfig.md#mepath)
- [nuxtUseCookie](types.FusionAuthConfig.md#nuxtusecookie)
- [onAutoRefreshFailure](types.FusionAuthConfig.md#onautorefreshfailure)
- [onRedirect](types.FusionAuthConfig.md#onredirect)
- [redirectUri](types.FusionAuthConfig.md#redirecturi)
- [registerPath](types.FusionAuthConfig.md#registerpath)
- [scope](types.FusionAuthConfig.md#scope)
- [serverUrl](types.FusionAuthConfig.md#serverurl)
- [shouldAutoFetchUserInfo](types.FusionAuthConfig.md#shouldautofetchuserinfo)
- [shouldAutoRefresh](types.FusionAuthConfig.md#shouldautorefresh)
- [tokenRefreshPath](types.FusionAuthConfig.md#tokenrefreshpath)

## Properties

### autoRefreshSecondsBeforeExpiry

• `Optional` **autoRefreshSecondsBeforeExpiry**: `number`

The number of seconds before the access token expiry when the auto refresh functionality kicks in if enabled. Default is 30.

#### Defined in

[types.ts:39](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L39)

---

### clientId

• **clientId**: `string`

The client id of the application.

#### Defined in

[types.ts:15](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L15)

---

### loginPath

• `Optional` **loginPath**: `string`

The path to the login endpoint.

#### Defined in

[types.ts:60](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L60)

---

### logoutPath

• `Optional` **logoutPath**: `string`

The path to the logout endpoint.

#### Defined in

[types.ts:64](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L64)

---

### mePath

• `Optional` **mePath**: `string`

The path to the me endpoint.

#### Defined in

[types.ts:76](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L76)

---

### nuxtUseCookie

• `Optional` **nuxtUseCookie**: `UseCookie`

Pass in `useCookie` from nuxt/app [useCookie](https://nuxt.com/docs/api/composables/use-cookie).
This is needed for the Vue SDK to support Nuxt/SSR.

#### Defined in

[types.ts:55](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L55)

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

[types.ts:49](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L49)

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

[types.ts:44](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L44)

---

### redirectUri

• **redirectUri**: `string`

The redirect URI of the application.

#### Defined in

[types.ts:19](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L19)

---

### registerPath

• `Optional` **registerPath**: `string`

The path to the register endpoint.

#### Defined in

[types.ts:68](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L68)

---

### scope

• `Optional` **scope**: `string`

The OAuth2 scope parameter passed to the `/oauth2/authorize` endpoint. If not specified fusionauth will default this to `openid offline_access`.

#### Defined in

[types.ts:24](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L24)

---

### serverUrl

• **serverUrl**: `string`

The URL of the FusionAuth server.

#### Defined in

[types.ts:11](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L11)

---

### shouldAutoFetchUserInfo

• `Optional` **shouldAutoFetchUserInfo**: `boolean`

Enables the SDK to automatically handle fetching user info when logged in. Defaults to false.

#### Defined in

[types.ts:34](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L34)

---

### shouldAutoRefresh

• `Optional` **shouldAutoRefresh**: `boolean`

Enables automatic token refreshing. Defaults to false.

#### Defined in

[types.ts:29](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L29)

---

### tokenRefreshPath

• `Optional` **tokenRefreshPath**: `string`

The path to the token refresh endpoint.

#### Defined in

[types.ts:72](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/caa8953c7c90c3c5f513995244552b941f06c795/packages/sdk-vue/src/types.ts#L72)
