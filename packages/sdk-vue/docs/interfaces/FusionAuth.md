[@fusionauth/vue-sdk](../README.md) / [Exports](../modules.md) / FusionAuth

# Interface: FusionAuth\<T\>

FusionAuth object provided at app-level by FusionAuthVuePlugin

## Type parameters

| Name | Type                      |
| :--- | :------------------------ |
| `T`  | [`UserInfo`](UserInfo.md) |

## Table of contents

### Properties

- [dpopFetch](FusionAuth.md#dpopfetch)
- [error](FusionAuth.md#error)
- [generateProof](FusionAuth.md#generateproof)
- [getAccessToken](FusionAuth.md#getaccesstoken)
- [getUserInfo](FusionAuth.md#getuserinfo)
- [initAutoRefresh](FusionAuth.md#initautorefresh)
- [isGettingUserInfo](FusionAuth.md#isgettinguserinfo)
- [isLoggedIn](FusionAuth.md#isloggedin)
- [login](FusionAuth.md#login)
- [logout](FusionAuth.md#logout)
- [manageAccount](FusionAuth.md#manageaccount)
- [refreshToken](FusionAuth.md#refreshtoken)
- [register](FusionAuth.md#register)
- [userInfo](FusionAuth.md#userinfo)

## Properties

### dpopFetch

• `Optional` **dpopFetch**: (`input`: `RequestInfo` \| `URL`, `init?`: `RequestInit`) => `Promise`\<`Response`\>

Fetch wrapper that automatically attaches DPoP proof headers.
Present only when `useDpop: true`.

#### Type declaration

▸ (`input`, `init?`): `Promise`\<`Response`\>

##### Parameters

| Name    | Type                   |
| :------ | :--------------------- |
| `input` | `RequestInfo` \| `URL` |
| `init?` | `RequestInit`          |

##### Returns

`Promise`\<`Response`\>

#### Defined in

[packages/sdk-vue/src/types.ts:194](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L194)

---

### error

• **error**: `Ref`\<`null` \| `Error`, `null` \| `Error`\>

Error occurred within getUserInfo.

#### Defined in

[packages/sdk-vue/src/types.ts:153](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L153)

---

### generateProof

• `Optional` **generateProof**: (`htu`: `string`, `htm`: `string`, `accessToken?`: `string`, `nonce?`: `string`) => `Promise`\<`string`\>

Returns a signed DPoP proof JWT for use with axios or other
HTTP libraries. Present only when `useDpop: true`.

#### Type declaration

▸ (`htu`, `htm`, `accessToken?`, `nonce?`): `Promise`\<`string`\>

##### Parameters

| Name           | Type     |
| :------------- | :------- |
| `htu`          | `string` |
| `htm`          | `string` |
| `accessToken?` | `string` |
| `nonce?`       | `string` |

##### Returns

`Promise`\<`string`\>

#### Defined in

[packages/sdk-vue/src/types.ts:203](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L203)

---

### getAccessToken

• `Optional` **getAccessToken**: () => `null` \| `string`

Returns the stored DPoP access token, or `null` if not logged in.
Throws a descriptive error when `useDpop: false`.
Present only when `useDpop: true`.

#### Type declaration

▸ (): `null` \| `string`

##### Returns

`null` \| `string`

#### Defined in

[packages/sdk-vue/src/types.ts:215](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L215)

---

### getUserInfo

• **getUserInfo**: () => `Promise`\<`undefined` \| `T`\>

This is handled automatically if the SDK is configured with `shouldAutoFetchUserInfo`.
Internally updates `isFetchingUser` and `userInfo` refs, as well as `error` if the request fails.

#### Type declaration

▸ (): `Promise`\<`undefined` \| `T`\>

##### Returns

`Promise`\<`undefined` \| `T`\>

#### Defined in

[packages/sdk-vue/src/types.ts:138](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L138)

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

[packages/sdk-vue/src/types.ts:188](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L188)

---

### isGettingUserInfo

• **isGettingUserInfo**: `Ref`\<`boolean`, `boolean`\>

Indicates that the getUserInfo call is unresolved.

#### Defined in

[packages/sdk-vue/src/types.ts:148](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L148)

---

### isLoggedIn

• **isLoggedIn**: `Ref`\<`boolean`, `boolean`\>

Whether the user is logged in.

#### Defined in

[packages/sdk-vue/src/types.ts:131](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L131)

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

[packages/sdk-vue/src/types.ts:159](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L159)

---

### logout

• **logout**: () => `void`

Initiates a logout.

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[packages/sdk-vue/src/types.ts:170](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L170)

---

### manageAccount

• **manageAccount**: () => `void`

Redirects to [self service account management](https://fusionauth.io/docs/lifecycle/manage-users/account-management/)
Self service account management is only available in FusionAuth paid plans.

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[packages/sdk-vue/src/types.ts:176](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L176)

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

[packages/sdk-vue/src/types.ts:182](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L182)

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

[packages/sdk-vue/src/types.ts:165](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L165)

---

### userInfo

• **userInfo**: `Ref`\<`null` \| `T`, `null` \| `T`\>

Data fetched from the configured 'me' endpoint.

#### Defined in

[packages/sdk-vue/src/types.ts:143](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cd7ae7b9456d5730265cf9895942c3e7263c1c85/packages/sdk-vue/src/types.ts#L143)
