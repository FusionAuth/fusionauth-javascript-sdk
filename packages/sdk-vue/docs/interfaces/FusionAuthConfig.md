[@fusionauth/vue-sdk](../README.md) / [Exports](../modules.md) / FusionAuthConfig

# Interface: FusionAuthConfig

Config for the FusionAuth Vue SDK

## Table of contents

### Properties

- [autoRefreshSecondsBeforeExpiry](FusionAuthConfig.md#autorefreshsecondsbeforeexpiry)
- [clientId](FusionAuthConfig.md#clientid)
- [loginPath](FusionAuthConfig.md#loginpath)
- [logoutPath](FusionAuthConfig.md#logoutpath)
- [mePath](FusionAuthConfig.md#mepath)
- [nuxtUseCookie](FusionAuthConfig.md#nuxtusecookie)
- [onAutoRefreshFailure](FusionAuthConfig.md#onautorefreshfailure)
- [onRedirect](FusionAuthConfig.md#onredirect)
- [postLogoutRedirectUri](FusionAuthConfig.md#postlogoutredirecturi)
- [redirectUri](FusionAuthConfig.md#redirecturi)
- [registerPath](FusionAuthConfig.md#registerpath)
- [scope](FusionAuthConfig.md#scope)
- [serverUrl](FusionAuthConfig.md#serverurl)
- [shouldAutoFetchUserInfo](FusionAuthConfig.md#shouldautofetchuserinfo)
- [shouldAutoRefresh](FusionAuthConfig.md#shouldautorefresh)
- [tokenRefreshPath](FusionAuthConfig.md#tokenrefreshpath)

## Properties

### autoRefreshSecondsBeforeExpiry

• `Optional` **autoRefreshSecondsBeforeExpiry**: `number`

The number of seconds before the access token expiry when the auto refresh functionality kicks in if enabled. Default is 30.

#### Defined in

[src/types.ts:44](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L44)

---

### clientId

• **clientId**: `string`

The client id of the application.

#### Defined in

[src/types.ts:15](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L15)

---

### loginPath

• `Optional` **loginPath**: `string`

The path to the login endpoint.

#### Defined in

[src/types.ts:65](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L65)

---

### logoutPath

• `Optional` **logoutPath**: `string`

The path to the logout endpoint.

#### Defined in

[src/types.ts:69](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L69)

---

### mePath

• `Optional` **mePath**: `string`

The path to the me endpoint.

#### Defined in

[src/types.ts:81](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L81)

---

### nuxtUseCookie

• `Optional` **nuxtUseCookie**: \<T\>(`name`: `string`, `_opts?`: `CookieOptions`\<`T`\> & \{ `readonly?`: `false` }) => `CookieRef`\<`T`\>\<T\>(`name`: `string`, `_opts`: `CookieOptions`\<`T`\> & \{ `readonly`: `true` }) => `Readonly`\<`CookieRef`\<`T`\>\>

Pass in `useCookie` from nuxt/app [useCookie](https://nuxt.com/docs/api/composables/use-cookie).
This is needed for the Vue SDK to support Nuxt/SSR.

#### Type declaration

▸ \<`T`\>(`name`, `_opts?`): `CookieRef`\<`T`\>

##### Type parameters

| Name | Type                              |
| :--- | :-------------------------------- |
| `T`  | `undefined` \| `null` \| `string` |

##### Parameters

| Name     | Type                                               |
| :------- | :------------------------------------------------- |
| `name`   | `string`                                           |
| `_opts?` | `CookieOptions`\<`T`\> & \{ `readonly?`: `false` } |

##### Returns

`CookieRef`\<`T`\>

▸ \<`T`\>(`name`, `_opts`): `Readonly`\<`CookieRef`\<`T`\>\>

##### Type parameters

| Name | Type                              |
| :--- | :-------------------------------- |
| `T`  | `undefined` \| `null` \| `string` |

##### Parameters

| Name    | Type                                             |
| :------ | :----------------------------------------------- |
| `name`  | `string`                                         |
| `_opts` | `CookieOptions`\<`T`\> & \{ `readonly`: `true` } |

##### Returns

`Readonly`\<`CookieRef`\<`T`\>\>

#### Defined in

[src/types.ts:60](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L60)

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

[src/types.ts:54](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L54)

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

[src/types.ts:49](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L49)

---

### postLogoutRedirectUri

• `Optional` **postLogoutRedirectUri**: `string`

The redirect URI for post-logout. Defaults the provided `redirectUri`.

#### Defined in

[src/types.ts:24](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L24)

---

### redirectUri

• **redirectUri**: `string`

The redirect URI of the application.

#### Defined in

[src/types.ts:19](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L19)

---

### registerPath

• `Optional` **registerPath**: `string`

The path to the register endpoint.

#### Defined in

[src/types.ts:73](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L73)

---

### scope

• `Optional` **scope**: `string`

The OAuth2 scope parameter passed to the `/oauth2/authorize` endpoint. If not specified fusionauth will default this to `openid offline_access`.

#### Defined in

[src/types.ts:29](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L29)

---

### serverUrl

• **serverUrl**: `string`

The URL of the FusionAuth server.

#### Defined in

[src/types.ts:11](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L11)

---

### shouldAutoFetchUserInfo

• `Optional` **shouldAutoFetchUserInfo**: `boolean`

Enables the SDK to automatically handle fetching user info when logged in. Defaults to false.

#### Defined in

[src/types.ts:39](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L39)

---

### shouldAutoRefresh

• `Optional` **shouldAutoRefresh**: `boolean`

Enables automatic token refreshing. Defaults to false.

#### Defined in

[src/types.ts:34](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L34)

---

### tokenRefreshPath

• `Optional` **tokenRefreshPath**: `string`

The path to the token refresh endpoint.

#### Defined in

[src/types.ts:77](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L77)
