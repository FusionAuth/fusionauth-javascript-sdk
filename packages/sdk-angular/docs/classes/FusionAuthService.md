[@fusionauth/angular-sdk](../README.md) / [Exports](../modules.md) / FusionAuthService

# Class: FusionAuthService

Service class to use with FusionAuth backend endpoints.

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
- [refreshToken](FusionAuthService.md#refreshtoken)
- [startLogin](FusionAuthService.md#startlogin)
- [startRegistration](FusionAuthService.md#startregistration)

## Constructors

### constructor

• **new FusionAuthService**(`config`): [`FusionAuthService`](FusionAuthService.md)

#### Parameters

| Name     | Type                                                    |
| :------- | :------------------------------------------------------ |
| `config` | [`FusionAuthConfig`](../interfaces/FusionAuthConfig.md) |

#### Returns

[`FusionAuthService`](FusionAuthService.md)

#### Defined in

[lib/fusion-auth.service.ts:13](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/b45b804c41f7355ea2e848325d965c928cec7c86/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L13)

## Properties

### autoRefreshTimer

• `Private` `Optional` **autoRefreshTimer**: `Timeout`

#### Defined in

[lib/fusion-auth.service.ts:10](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/b45b804c41f7355ea2e848325d965c928cec7c86/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L10)

---

### core

• `Private` **core**: `U`

#### Defined in

[lib/fusion-auth.service.ts:9](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/b45b804c41f7355ea2e848325d965c928cec7c86/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L9)

---

### isLoggedIn$

• **isLoggedIn$**: `Observable`\<`boolean`\>

An observable representing whether the user is logged in.

#### Defined in

[lib/fusion-auth.service.ts:32](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/b45b804c41f7355ea2e848325d965c928cec7c86/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L32)

---

### isLoggedInSubject

• `Private` **isLoggedInSubject**: `BehaviorSubject`\<`boolean`\>

#### Defined in

[lib/fusion-auth.service.ts:11](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/b45b804c41f7355ea2e848325d965c928cec7c86/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L11)

## Methods

### getUserInfo

▸ **getUserInfo**(): `Promise`\<[`UserInfo`](../interfaces/UserInfo.md)\>

Fetches userInfo from the 'me' endpoint.

#### Returns

`Promise`\<[`UserInfo`](../interfaces/UserInfo.md)\>

**`Throws`**

- if an error occurred while fetching.

#### Defined in

[lib/fusion-auth.service.ts:90](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/b45b804c41f7355ea2e848325d965c928cec7c86/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L90)

---

### getUserInfoObservable

▸ **getUserInfoObservable**(`callbacks?`): `Observable`\<[`UserInfo`](../interfaces/UserInfo.md)\>

Returns an observable request that fetches userInfo, and catches error.

#### Parameters

| Name                 | Type         |
| :------------------- | :----------- |
| `callbacks?`         | `Object`     |
| `callbacks.onBegin?` | () => `void` |
| `callbacks.onDone?`  | () => `void` |

#### Returns

`Observable`\<[`UserInfo`](../interfaces/UserInfo.md)\>

#### Defined in

[lib/fusion-auth.service.ts:62](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/b45b804c41f7355ea2e848325d965c928cec7c86/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L62)

---

### initAutoRefresh

▸ **initAutoRefresh**(): `void`

Initializes automatic access token refreshing.
This is handled automatically if the SDK is configured with `shouldAutoRefresh`.

#### Returns

`void`

#### Defined in

[lib/fusion-auth.service.ts:51](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/b45b804c41f7355ea2e848325d965c928cec7c86/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L51)

---

### isLoggedIn

▸ **isLoggedIn**(): `boolean`

A function that returns whether the user is logged in. This returned value is non-observable.

#### Returns

`boolean`

#### Defined in

[lib/fusion-auth.service.ts:35](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/b45b804c41f7355ea2e848325d965c928cec7c86/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L35)

---

### logout

▸ **logout**(): `void`

Initiates logout flow.

#### Returns

`void`

#### Defined in

[lib/fusion-auth.service.ts:113](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/b45b804c41f7355ea2e848325d965c928cec7c86/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L113)

---

### refreshToken

▸ **refreshToken**(): `Promise`\<`Response`\>

Refreshes the access token a single time.
Automatic token refreshing can be enabled if the SDK is configured with `shouldAutoRefresh`.

#### Returns

`Promise`\<`Response`\>

#### Defined in

[lib/fusion-auth.service.ts:43](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/b45b804c41f7355ea2e848325d965c928cec7c86/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L43)

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

[lib/fusion-auth.service.ts:98](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/b45b804c41f7355ea2e848325d965c928cec7c86/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L98)

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

[lib/fusion-auth.service.ts:106](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/b45b804c41f7355ea2e848325d965c928cec7c86/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L106)
