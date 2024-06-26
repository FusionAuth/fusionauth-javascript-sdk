[@fusionauth/vue-sdk](../README.md) / [Exports](../modules.md) / FusionAuth

# Interface: FusionAuth\<T\>

FusionAuth object provided at app-level by FusionAuthVuePlugin

## Type parameters

| Name | Type                      |
| :--- | :------------------------ |
| `T`  | [`UserInfo`](UserInfo.md) |

## Table of contents

### Properties

- [error](FusionAuth.md#error)
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

### error

• **error**: `Ref`\<`null` \| `Error`\>

Error occurred within getUserInfo.

#### Defined in

[src/types.ts:134](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L134)

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

[src/types.ts:119](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L119)

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

[src/types.ts:169](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L169)

---

### isGettingUserInfo

• **isGettingUserInfo**: `Ref`\<`boolean`\>

Indicates that the getUserInfo call is unresolved.

#### Defined in

[src/types.ts:129](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L129)

---

### isLoggedIn

• **isLoggedIn**: `Ref`\<`boolean`\>

Whether the user is logged in.

#### Defined in

[src/types.ts:112](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L112)

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

[src/types.ts:140](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L140)

---

### logout

• **logout**: () => `void`

Initiates a logout.

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[src/types.ts:151](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L151)

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

[src/types.ts:157](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L157)

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

[src/types.ts:163](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L163)

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

[src/types.ts:146](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L146)

---

### userInfo

• **userInfo**: `Ref`\<`null` \| `T`\>

Data fetched from the configured 'me' endpoint.

#### Defined in

[src/types.ts:124](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/types.ts#L124)
