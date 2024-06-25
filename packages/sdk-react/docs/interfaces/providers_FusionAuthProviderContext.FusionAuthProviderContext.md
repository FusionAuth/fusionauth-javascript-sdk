[@fusionauth/react-sdk](../README.md) / [Modules](../modules.md) / [providers/FusionAuthProviderContext](../modules/providers_FusionAuthProviderContext.md) / FusionAuthProviderContext

# Interface: FusionAuthProviderContext\<T\>

[providers/FusionAuthProviderContext](../modules/providers_FusionAuthProviderContext.md).FusionAuthProviderContext

The context provided by FusionAuth React SDK

## Type parameters

| Name | Type       |
| :--- | :--------- |
| `T`  | `UserInfo` |

## Table of contents

### Properties

- [error](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#error)
- [fetchUserInfo](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#fetchuserinfo)
- [initAutoRefresh](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#initautorefresh)
- [isFetchingUserInfo](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#isfetchinguserinfo)
- [isLoggedIn](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#isloggedin)
- [manageAccount](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#manageaccount)
- [refreshToken](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#refreshtoken)
- [startLogin](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#startlogin)
- [startLogout](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#startlogout)
- [startRegister](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#startregister)
- [userInfo](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#userinfo)

## Properties

### error

• **error**: `null` \| `Error`

Error occurred while fetching userInfo.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:29](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L29)

---

### fetchUserInfo

• **fetchUserInfo**: () => `Promise`\<`undefined` \| `T`\>

Fetches user info from the 'me' endpoint.
This is handled automatically if the SDK is configured with `shouldAutoFetchUserInfo`.

#### Type declaration

▸ (): `Promise`\<`undefined` \| `T`\>

##### Returns

`Promise`\<`undefined` \| `T`\>

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:19](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L19)

---

### initAutoRefresh

• **initAutoRefresh**: () => `void`

Initializes automatic access token refreshing.
This is handled automatically if the SDK is configured with `shouldAutoRefresh`.

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:64](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L64)

---

### isFetchingUserInfo

• **isFetchingUserInfo**: `boolean`

Indicates that the fetchUserInfo call is unresolved.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:24](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L24)

---

### isLoggedIn

• **isLoggedIn**: `boolean`

Whether the user is logged in.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:8](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L8)

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:52](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L52)

---

### refreshToken

• **refreshToken**: () => `Promise`\<`undefined` \| `Response`\>

Refreshes the access token a single time.
This is handled automatically if the SDK is configured with `shouldAutoRefresh`.

#### Type declaration

▸ (): `Promise`\<`undefined` \| `Response`\>

##### Returns

`Promise`\<`undefined` \| `Response`\>

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:58](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L58)

---

### startLogin

• **startLogin**: (`state?`: `string`) => `void`

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:35](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L35)

---

### startLogout

• **startLogout**: () => `void`

Initiates logout flow.

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:46](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L46)

---

### startRegister

• **startRegister**: (`state?`: `string`) => `void`

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:41](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L41)

---

### userInfo

• **userInfo**: `null` \| `T`

Data fetched from the configured 'me' endpoint.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:13](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6b00f96f26d9e2dbbacedeab842a037e53b50aa6/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L13)
