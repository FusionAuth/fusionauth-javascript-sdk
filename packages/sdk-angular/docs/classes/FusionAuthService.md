[@fusionauth/angular-sdk](../README.md) / [Exports](../modules.md) / FusionAuthService

# Class: FusionAuthService\<T\>

Service class to use with FusionAuth backend endpoints.

## Type parameters

| Name | Type                                    |
| :--- | :-------------------------------------- |
| `T`  | [`UserInfo`](../interfaces/UserInfo.md) |

## Table of contents

### Constructors

- [constructor](FusionAuthService.md#constructor)

### Properties

- [autoRefreshTimer](FusionAuthService.md#autorefreshtimer)
- [core](FusionAuthService.md#core)
- [isLoggedIn$](FusionAuthService.md#isloggedin$)
- [isLoggedInSignal](FusionAuthService.md#isloggedinsignal)
- [isLoggedInState](FusionAuthService.md#isloggedinstate)

### Methods

- [dpopFetch](FusionAuthService.md#dpopfetch)
- [generateProof](FusionAuthService.md#generateproof)
- [getAccessToken](FusionAuthService.md#getaccesstoken)
- [getUserInfo](FusionAuthService.md#getuserinfo)
- [getUserInfoObservable](FusionAuthService.md#getuserinfoobservable)
- [initAutoRefresh](FusionAuthService.md#initautorefresh)
- [isLoggedIn](FusionAuthService.md#isloggedin)
- [logout](FusionAuthService.md#logout)
- [manageAccount](FusionAuthService.md#manageaccount)
- [refreshToken](FusionAuthService.md#refreshtoken)
- [startLogin](FusionAuthService.md#startlogin)
- [startRegistration](FusionAuthService.md#startregistration)

## Constructors

### constructor

• **new FusionAuthService**\<`T`\>(`config`, `platformId`): [`FusionAuthService`](FusionAuthService.md)\<`T`\>

#### Type parameters

| Name | Type                                    |
| :--- | :-------------------------------------- |
| `T`  | [`UserInfo`](../interfaces/UserInfo.md) |

#### Parameters

| Name         | Type                                                    |
| :----------- | :------------------------------------------------------ |
| `config`     | [`FusionAuthConfig`](../interfaces/FusionAuthConfig.md) |
| `platformId` | `Object`                                                |

#### Returns

[`FusionAuthService`](FusionAuthService.md)\<`T`\>

#### Defined in

[lib/fusion-auth.service.ts:29](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L29)

## Properties

### autoRefreshTimer

• `Private` `Optional` **autoRefreshTimer**: `Timeout`

#### Defined in

[lib/fusion-auth.service.ts:26](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L26)

---

### core

• `Private` **core**: `SDKCore`

#### Defined in

[lib/fusion-auth.service.ts:25](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L25)

---

### isLoggedIn$

• **isLoggedIn$**: `Observable`\<`boolean`\>

An observable representing whether the user is logged in.

#### Defined in

[lib/fusion-auth.service.ts:58](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L58)

---

### isLoggedInSignal

• **isLoggedInSignal**: `Signal`\<`boolean`\>

A Signal representing whether the user is logged in.

#### Defined in

[lib/fusion-auth.service.ts:63](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L63)

---

### isLoggedInState

• `Private` **isLoggedInState**: `WritableSignal`\<`boolean`\>

#### Defined in

[lib/fusion-auth.service.ts:27](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L27)

## Methods

### dpopFetch

▸ **dpopFetch**(`input`, `init?`): `Promise`\<`Response`\>

DPoP mode `fetch()` wrapper that automatically attaches DPoP proof
headers.

#### Parameters

| Name    | Type                   |
| :------ | :--------------------- |
| `input` | `URL` \| `RequestInfo` |
| `init?` | `RequestInit`          |

#### Returns

`Promise`\<`Response`\>

**`Throws`**

if called when `useDpop` is not enabled.

#### Defined in

[lib/fusion-auth.service.ts:163](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L163)

---

### generateProof

▸ **generateProof**(`htu`, `htm`, `accessToken?`, `nonce?`): `Promise`\<`string`\>

Returns a signed DPoP proof JWT for use with axios or other
HTTP libraries that can't use [dpopFetch](FusionAuthService.md#dpopfetch).

#### Parameters

| Name           | Type     |
| :------------- | :------- |
| `htu`          | `string` |
| `htm`          | `string` |
| `accessToken?` | `string` |
| `nonce?`       | `string` |

#### Returns

`Promise`\<`string`\>

**`Throws`**

if called when `useDpop` is not enabled.

#### Defined in

[lib/fusion-auth.service.ts:175](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L175)

---

### getAccessToken

▸ **getAccessToken**(): `null` \| `string`

Returns the stored DPoP access token, or `null` if not logged in.

#### Returns

`null` \| `string`

**`Throws`**

if called when `useDpop` is not enabled.

#### Defined in

[lib/fusion-auth.service.ts:188](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L188)

---

### getUserInfo

▸ **getUserInfo**\<`T`\>(): `Promise`\<`T`\>

Fetches userInfo from the 'me' endpoint.

#### Type parameters

| Name |
| :--- |
| `T`  |

#### Returns

`Promise`\<`T`\>

**`Throws`**

- if an error occurred while fetching.

#### Defined in

[lib/fusion-auth.service.ts:123](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L123)

---

### getUserInfoObservable

▸ **getUserInfoObservable**(`callbacks?`): `Observable`\<`T`\>

Returns an observable request that fetches userInfo, and catches error.

#### Parameters

| Name                 | Type         |
| :------------------- | :----------- |
| `callbacks?`         | `Object`     |
| `callbacks.onBegin?` | () => `void` |
| `callbacks.onDone?`  | () => `void` |

#### Returns

`Observable`\<`T`\>

#### Defined in

[lib/fusion-auth.service.ts:95](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L95)

---

### initAutoRefresh

▸ **initAutoRefresh**(): `void`

Initializes automatic access token refreshing.
This is handled automatically if the SDK is configured with `shouldAutoRefresh`.

#### Returns

`void`

#### Defined in

[lib/fusion-auth.service.ts:84](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L84)

---

### isLoggedIn

▸ **isLoggedIn**(): `boolean`

A function that returns whether the user is logged in. This returned value is non-observable.

#### Returns

`boolean`

#### Defined in

[lib/fusion-auth.service.ts:66](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L66)

---

### logout

▸ **logout**(): `void`

Initiates logout flow.

#### Returns

`void`

#### Defined in

[lib/fusion-auth.service.ts:146](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L146)

---

### manageAccount

▸ **manageAccount**(): `void`

Redirects to [self service account management](https://fusionauth.io/docs/lifecycle/manage-users/account-management/)
Self service account management is only available in FusionAuth paid plans.

#### Returns

`void`

#### Defined in

[lib/fusion-auth.service.ts:154](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L154)

---

### refreshToken

▸ **refreshToken**(): `Promise`\<`Response`\>

Refreshes the access token a single time.
Automatic token refreshing can be enabled if the SDK is configured with `shouldAutoRefresh`.

#### Returns

`Promise`\<`Response`\>

#### Defined in

[lib/fusion-auth.service.ts:74](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L74)

---

### startLogin

▸ **startLogin**(`state?`): `void`

Initiates login flow.

#### Parameters

| Name     | Type     | Description                                                |
| :------- | :------- | :--------------------------------------------------------- |
| `state?` | `string` | Optional value to be echoed back to the SDK upon redirect. |

#### Returns

`void`

#### Defined in

[lib/fusion-auth.service.ts:131](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L131)

---

### startRegistration

▸ **startRegistration**(`state?`): `void`

Initiates register flow.

#### Parameters

| Name     | Type     | Description                                                |
| :------- | :------- | :--------------------------------------------------------- |
| `state?` | `string` | Optional value to be echoed back to the SDK upon redirect. |

#### Returns

`void`

#### Defined in

[lib/fusion-auth.service.ts:139](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/9753a69c121f6e2e10cadc2d5394958fc9e8cb19/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L139)
