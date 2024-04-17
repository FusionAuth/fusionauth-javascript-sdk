[@fusionauth/react-sdk](../README.md) / [Modules](../modules.md) / [FusionAuthProviderConfig](../modules/FusionAuthProviderConfig.md) / FusionAuthProviderConfig

# Interface: FusionAuthProviderConfig

[FusionAuthProviderConfig](../modules/FusionAuthProviderConfig.md).FusionAuthProviderConfig

Config for FusionAuthProvider

## Table of contents

### Properties

- [accessTokenExpireCookieName](FusionAuthProviderConfig.FusionAuthProviderConfig.md#accesstokenexpirecookiename)
- [autoRefreshSecondsBeforeExpiry](FusionAuthProviderConfig.FusionAuthProviderConfig.md#autorefreshsecondsbeforeexpiry)
- [clientId](FusionAuthProviderConfig.FusionAuthProviderConfig.md#clientid)
- [loginPath](FusionAuthProviderConfig.FusionAuthProviderConfig.md#loginpath)
- [logoutPath](FusionAuthProviderConfig.FusionAuthProviderConfig.md#logoutpath)
- [mePath](FusionAuthProviderConfig.FusionAuthProviderConfig.md#mepath)
- [onRedirect](FusionAuthProviderConfig.FusionAuthProviderConfig.md#onredirect)
- [redirectUri](FusionAuthProviderConfig.FusionAuthProviderConfig.md#redirecturi)
- [registerPath](FusionAuthProviderConfig.FusionAuthProviderConfig.md#registerpath)
- [serverUrl](FusionAuthProviderConfig.FusionAuthProviderConfig.md#serverurl)
- [shouldAutoFetchUserInfo](FusionAuthProviderConfig.FusionAuthProviderConfig.md#shouldautofetchuserinfo)
- [shouldAutoRefresh](FusionAuthProviderConfig.FusionAuthProviderConfig.md#shouldautorefresh)
- [tokenRefreshPath](FusionAuthProviderConfig.FusionAuthProviderConfig.md#tokenrefreshpath)

## Properties

### accessTokenExpireCookieName

• `Optional` **accessTokenExpireCookieName**: `string`

The name of the access token expiration moment cookie.
Only set this if you are hosting server that uses a custom name for the 'app.at_exp' cookie.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:69](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L69)

---

### autoRefreshSecondsBeforeExpiry

• `Optional` **autoRefreshSecondsBeforeExpiry**: `number`

The number of seconds before the access token expiry when the auto refresh functionality kicks in if enabled. Default is 10.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:33](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L33)

---

### clientId

• **clientId**: `string`

The client id of the application.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:13](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L13)

---

### loginPath

• `Optional` **loginPath**: `string`

The path to the login endpoint.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:43](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L43)

---

### logoutPath

• `Optional` **logoutPath**: `string`

The path to the logout endpoint.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:53](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L53)

---

### mePath

• `Optional` **mePath**: `string`

The path to the me endpoint.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:63](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L63)

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

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:38](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L38)

---

### redirectUri

• **redirectUri**: `string`

The redirect URI of the application.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:18](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L18)

---

### registerPath

• `Optional` **registerPath**: `string`

The path to the register endpoint.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:48](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L48)

---

### serverUrl

• **serverUrl**: `string`

The URL of the server that performs the token exchange.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:8](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L8)

---

### shouldAutoFetchUserInfo

• `Optional` **shouldAutoFetchUserInfo**: `boolean`

Enables the SDK to automatically handle fetching user info when logged in. Defaults to false.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:28](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L28)

---

### shouldAutoRefresh

• `Optional` **shouldAutoRefresh**: `boolean`

Enables automatic token refreshing. Defaults to false.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:23](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L23)

---

### tokenRefreshPath

• `Optional` **tokenRefreshPath**: `string`

The path to the token refresh endpoint.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts:58](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProviderConfig.ts#L58)
