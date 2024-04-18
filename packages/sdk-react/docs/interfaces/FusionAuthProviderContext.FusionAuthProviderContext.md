[@fusionauth/react-sdk](../README.md) / [Modules](../modules.md) / [FusionAuthProviderContext](../modules/FusionAuthProviderContext.md) / FusionAuthProviderContext

# Interface: FusionAuthProviderContext

[FusionAuthProviderContext](../modules/FusionAuthProviderContext.md).FusionAuthProviderContext

The context provided by FusionAuth React SDK

## Table of contents

### Properties

- [error](FusionAuthProviderContext.FusionAuthProviderContext.md#error)
- [fetchUserInfo](FusionAuthProviderContext.FusionAuthProviderContext.md#fetchuserinfo)
- [initAutoRefresh](FusionAuthProviderContext.FusionAuthProviderContext.md#initautorefresh)
- [isFetchingUserInfo](FusionAuthProviderContext.FusionAuthProviderContext.md#isfetchinguserinfo)
- [isLoggedIn](FusionAuthProviderContext.FusionAuthProviderContext.md#isloggedin)
- [refreshToken](FusionAuthProviderContext.FusionAuthProviderContext.md#refreshtoken)
- [startLogin](FusionAuthProviderContext.FusionAuthProviderContext.md#startlogin)
- [startLogout](FusionAuthProviderContext.FusionAuthProviderContext.md#startlogout)
- [startRegister](FusionAuthProviderContext.FusionAuthProviderContext.md#startregister)
- [userInfo](FusionAuthProviderContext.FusionAuthProviderContext.md#userinfo)

## Properties

### error

• **error**: `null` \| `Error`

Error occurred while fetching userInfo.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:30](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/70d5b677cad1a2b11d090d5c6c3e06a3a491f098/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L30)

---

### fetchUserInfo

• **fetchUserInfo**: () => `Promise`\<`undefined` \| `UserInfo`\>

Fetches user info from the 'me' endpoint.
This is handled automatically if the SDK is configured with `shouldAutoFetchUserInfo`.

#### Type declaration

▸ (): `Promise`\<`undefined` \| `UserInfo`\>

##### Returns

`Promise`\<`undefined` \| `UserInfo`\>

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:20](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/70d5b677cad1a2b11d090d5c6c3e06a3a491f098/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L20)

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:59](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/70d5b677cad1a2b11d090d5c6c3e06a3a491f098/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L59)

---

### isFetchingUserInfo

• **isFetchingUserInfo**: `boolean`

Indicates that the fetchUserInfo call is unresolved.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:25](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/70d5b677cad1a2b11d090d5c6c3e06a3a491f098/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L25)

---

### isLoggedIn

• **isLoggedIn**: `boolean`

Whether the user is logged in.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:8](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/70d5b677cad1a2b11d090d5c6c3e06a3a491f098/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L8)

---

### refreshToken

• **refreshToken**: () => `Promise`\<`void`\>

Refreshes the access token a single time.
This is handled automatically if the SDK is configured with `shouldAutoRefresh`.

#### Type declaration

▸ (): `Promise`\<`void`\>

##### Returns

`Promise`\<`void`\>

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:53](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/70d5b677cad1a2b11d090d5c6c3e06a3a491f098/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L53)

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:36](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/70d5b677cad1a2b11d090d5c6c3e06a3a491f098/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L36)

---

### startLogout

• **startLogout**: () => `void`

Initiates logout flow.

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:47](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/70d5b677cad1a2b11d090d5c6c3e06a3a491f098/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L47)

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

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:42](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/70d5b677cad1a2b11d090d5c6c3e06a3a491f098/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L42)

---

### userInfo

• **userInfo**: `null` \| `UserInfo`

Data fetched from the configured 'me' endpoint.

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts:13](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/70d5b677cad1a2b11d090d5c6c3e06a3a491f098/packages/sdk-react/src/components/providers/FusionAuthProviderContext.ts#L13)
