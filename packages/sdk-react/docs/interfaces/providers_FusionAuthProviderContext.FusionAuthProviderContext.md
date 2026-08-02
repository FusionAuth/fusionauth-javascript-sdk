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

- [dpopFetch](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#dpopfetch)
- [error](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#error)
- [fetchUserInfo](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#fetchuserinfo)
- [generateProof](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#generateproof)
- [getAccessToken](providers_FusionAuthProviderContext.FusionAuthProviderContext.md#getaccesstoken)
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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:70](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L70)

---

### error

• **error**: `null` \| `Error`

Error occurred while fetching userInfo.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:29](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L29)

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:19](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L19)

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:79](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L79)

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:91](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L91)

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:64](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L64)

---

### isFetchingUserInfo

• **isFetchingUserInfo**: `boolean`

Indicates that the fetchUserInfo call is unresolved.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:24](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L24)

---

### isLoggedIn

• **isLoggedIn**: `boolean`

Whether the user is logged in.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:8](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L8)

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:52](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L52)

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:58](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L58)

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:35](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L35)

---

### startLogout

• **startLogout**: () => `void`

Initiates logout flow.

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:46](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L46)

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:41](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L41)

---

### userInfo

• **userInfo**: `null` \| `T`

Data fetched from the configured 'me' endpoint.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:13](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L13)
