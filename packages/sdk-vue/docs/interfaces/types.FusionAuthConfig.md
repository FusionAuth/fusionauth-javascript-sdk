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

[types.ts:38](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/fcd17d440e603901f23776175e07b35fc625e758/packages/sdk-vue/src/types.ts#L38)

---

### clientId

• **clientId**: `string`

The client id of the application.

#### Defined in

[types.ts:14](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/fcd17d440e603901f23776175e07b35fc625e758/packages/sdk-vue/src/types.ts#L14)

---

### loginPath

• `Optional` **loginPath**: `string`

The path to the login endpoint.

#### Defined in

[types.ts:48](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/fcd17d440e603901f23776175e07b35fc625e758/packages/sdk-vue/src/types.ts#L48)

---

### logoutPath

• `Optional` **logoutPath**: `string`

The path to the logout endpoint.

#### Defined in

[types.ts:52](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/fcd17d440e603901f23776175e07b35fc625e758/packages/sdk-vue/src/types.ts#L52)

---

### mePath

• `Optional` **mePath**: `string`

The path to the me endpoint.

#### Defined in

[types.ts:64](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/fcd17d440e603901f23776175e07b35fc625e758/packages/sdk-vue/src/types.ts#L64)

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

[types.ts:43](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/fcd17d440e603901f23776175e07b35fc625e758/packages/sdk-vue/src/types.ts#L43)

---

### redirectUri

• **redirectUri**: `string`

The redirect URI of the application.

#### Defined in

[types.ts:18](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/fcd17d440e603901f23776175e07b35fc625e758/packages/sdk-vue/src/types.ts#L18)

---

### registerPath

• `Optional` **registerPath**: `string`

The path to the register endpoint.

#### Defined in

[types.ts:56](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/fcd17d440e603901f23776175e07b35fc625e758/packages/sdk-vue/src/types.ts#L56)

---

### scope

• `Optional` **scope**: `string`

The OAuth2 scope parameter passed to the `/oauth2/authorize` endpoint. If not specified fusionauth will default this to `openid offline_access`.

#### Defined in

[types.ts:23](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/fcd17d440e603901f23776175e07b35fc625e758/packages/sdk-vue/src/types.ts#L23)

---

### serverUrl

• **serverUrl**: `string`

The URL of the FusionAuth server.

#### Defined in

[types.ts:10](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/fcd17d440e603901f23776175e07b35fc625e758/packages/sdk-vue/src/types.ts#L10)

---

### shouldAutoFetchUserInfo

• `Optional` **shouldAutoFetchUserInfo**: `boolean`

Enables the SDK to automatically handle fetching user info when logged in. Defaults to false.

#### Defined in

[types.ts:33](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/fcd17d440e603901f23776175e07b35fc625e758/packages/sdk-vue/src/types.ts#L33)

---

### shouldAutoRefresh

• `Optional` **shouldAutoRefresh**: `boolean`

Enables automatic token refreshing. Defaults to false.

#### Defined in

[types.ts:28](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/fcd17d440e603901f23776175e07b35fc625e758/packages/sdk-vue/src/types.ts#L28)

---

### tokenRefreshPath

• `Optional` **tokenRefreshPath**: `string`

The path to the token refresh endpoint.

#### Defined in

[types.ts:60](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/fcd17d440e603901f23776175e07b35fc625e758/packages/sdk-vue/src/types.ts#L60)
