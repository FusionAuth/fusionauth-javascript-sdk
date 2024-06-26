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
- [isLoggedInSubject](FusionAuthService.md#isloggedinsubject)

### Methods

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

[lib/fusion-auth.service.ts:21](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L21)

## Properties

### autoRefreshTimer

• `Private` `Optional` **autoRefreshTimer**: `Timeout`

#### Defined in

[lib/fusion-auth.service.ts:18](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L18)

---

### core

• `Private` **core**: `SDKCore`

#### Defined in

[lib/fusion-auth.service.ts:17](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L17)

---

### isLoggedIn$

• **isLoggedIn$**: `Observable`\<`boolean`\>

An observable representing whether the user is logged in.

#### Defined in

[lib/fusion-auth.service.ts:44](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L44)

---

### isLoggedInSubject

• `Private` **isLoggedInSubject**: `BehaviorSubject`\<`boolean`\>

#### Defined in

[lib/fusion-auth.service.ts:19](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L19)

## Methods

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

[lib/fusion-auth.service.ts:102](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L102)

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

[lib/fusion-auth.service.ts:74](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L74)

---

### initAutoRefresh

▸ **initAutoRefresh**(): `void`

Initializes automatic access token refreshing.
This is handled automatically if the SDK is configured with `shouldAutoRefresh`.

#### Returns

`void`

#### Defined in

[lib/fusion-auth.service.ts:63](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L63)

---

### isLoggedIn

▸ **isLoggedIn**(): `boolean`

A function that returns whether the user is logged in. This returned value is non-observable.

#### Returns

`boolean`

#### Defined in

[lib/fusion-auth.service.ts:47](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L47)

---

### logout

▸ **logout**(): `void`

Initiates logout flow.

#### Returns

`void`

#### Defined in

[lib/fusion-auth.service.ts:125](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L125)

---

### manageAccount

▸ **manageAccount**(): `void`

Redirects to [self service account management](https://fusionauth.io/docs/lifecycle/manage-users/account-management/)
Self service account management is only available in FusionAuth paid plans.

#### Returns

`void`

#### Defined in

[lib/fusion-auth.service.ts:133](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L133)

---

### refreshToken

▸ **refreshToken**(): `Promise`\<`Response`\>

Refreshes the access token a single time.
Automatic token refreshing can be enabled if the SDK is configured with `shouldAutoRefresh`.

#### Returns

`Promise`\<`Response`\>

#### Defined in

[lib/fusion-auth.service.ts:55](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L55)

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

[lib/fusion-auth.service.ts:110](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L110)

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

[lib/fusion-auth.service.ts:118](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/80c01c9ccb450a2187bc0d2cc65fa8c9c38cfabe/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L118)
