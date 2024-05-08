[@fusionauth/vue-sdk](../README.md) / [Modules](../modules.md) / [types](../modules/types.md) / FusionAuth

# Interface: FusionAuth

[types](../modules/types.md).FusionAuth

FusionAuth object provided at app-level by FusionAuthVuePlugin

## Table of contents

### Properties

- [error](types.FusionAuth.md#error)
- [getUserInfo](types.FusionAuth.md#getuserinfo)
- [initAutoRefresh](types.FusionAuth.md#initautorefresh)
- [isGettingUserInfo](types.FusionAuth.md#isgettinguserinfo)
- [isLoggedIn](types.FusionAuth.md#isloggedin)
- [login](types.FusionAuth.md#login)
- [logout](types.FusionAuth.md#logout)
- [refreshToken](types.FusionAuth.md#refreshtoken)
- [register](types.FusionAuth.md#register)
- [userInfo](types.FusionAuth.md#userinfo)

## Properties

### error

• **error**: `Ref`\<`null` \| `Error`\>

Error occurred within getUserInfo.

#### Defined in

[types.ts:118](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/525bfc3280cf0ce66d562e4b96351ecc387e5857/packages/sdk-vue/src/types.ts#L118)

---

### getUserInfo

• **getUserInfo**: () => `Promise`\<`undefined` \| [`UserInfo`](types.UserInfo.md)\>

This is handled automatically if the SDK is configured with `shouldAutoFetchUserInfo`.
Internally updates `isFetchingUser` and `userInfo` refs, as well as `error` if the request fails.

#### Type declaration

▸ (): `Promise`\<`undefined` \| [`UserInfo`](types.UserInfo.md)\>

##### Returns

`Promise`\<`undefined` \| [`UserInfo`](types.UserInfo.md)\>

#### Defined in

[types.ts:103](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/525bfc3280cf0ce66d562e4b96351ecc387e5857/packages/sdk-vue/src/types.ts#L103)

---

### initAutoRefresh

• **initAutoRefresh**: () => `undefined` \| `Timeout`

Initializes automatic refreshing of the access token.
Refresh is scheduled to happen at the configured `autoRefreshSecondsBeforeExpiry`.

#### Type declaration

▸ (): `undefined` \| `Timeout`

##### Returns

`undefined` \| `Timeout`

#### Defined in

[types.ts:147](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/525bfc3280cf0ce66d562e4b96351ecc387e5857/packages/sdk-vue/src/types.ts#L147)

---

### isGettingUserInfo

• **isGettingUserInfo**: `Ref`\<`boolean`\>

Indicates that the getUserInfo call is unresolved.

#### Defined in

[types.ts:113](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/525bfc3280cf0ce66d562e4b96351ecc387e5857/packages/sdk-vue/src/types.ts#L113)

---

### isLoggedIn

• **isLoggedIn**: `Ref`\<`boolean`\>

Whether the user is logged in.

#### Defined in

[types.ts:96](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/525bfc3280cf0ce66d562e4b96351ecc387e5857/packages/sdk-vue/src/types.ts#L96)

---

### login

• **login**: (`state?`: `string`) => `void`

Initiates login flow.

#### Type declaration

▸ (`state?`): `void`

##### Parameters

| Name     | Type     | Description                                                |
| :------- | :------- | :--------------------------------------------------------- |
| `state?` | `string` | Optional value to be echoed back to the SDK upon redirect. |

##### Returns

`void`

#### Defined in

[types.ts:124](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/525bfc3280cf0ce66d562e4b96351ecc387e5857/packages/sdk-vue/src/types.ts#L124)

---

### logout

• **logout**: () => `void`

Initiates a logout.

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[types.ts:135](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/525bfc3280cf0ce66d562e4b96351ecc387e5857/packages/sdk-vue/src/types.ts#L135)

---

### refreshToken

• **refreshToken**: () => `Promise`\<`Response`\>

Refreshes the access token a single time.
Token refreshing is handled automatically if configured with `shouldAutoRefresh`.

#### Type declaration

▸ (): `Promise`\<`Response`\>

##### Returns

`Promise`\<`Response`\>

#### Defined in

[types.ts:141](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/525bfc3280cf0ce66d562e4b96351ecc387e5857/packages/sdk-vue/src/types.ts#L141)

---

### register

• **register**: (`state?`: `string`) => `void`

Initiates register flow.

#### Type declaration

▸ (`state?`): `void`

##### Parameters

| Name     | Type     | Description                                                |
| :------- | :------- | :--------------------------------------------------------- |
| `state?` | `string` | Optional value to be echoed back to the SDK upon redirect. |

##### Returns

`void`

#### Defined in

[types.ts:130](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/525bfc3280cf0ce66d562e4b96351ecc387e5857/packages/sdk-vue/src/types.ts#L130)

---

### userInfo

• **userInfo**: `Ref`\<`null` \| [`UserInfo`](types.UserInfo.md)\>

Data fetched from the configured 'me' endpoint.

#### Defined in

[types.ts:108](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/525bfc3280cf0ce66d562e4b96351ecc387e5857/packages/sdk-vue/src/types.ts#L108)
