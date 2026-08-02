[**@fusionauth/angular-sdk**](../README.md)

---

[@fusionauth/angular-sdk](../globals.md) / FusionAuthService

# Class: FusionAuthService\<T\>

Defined in: [fusion-auth.service.ts:24](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L24)

Service class to use with FusionAuth backend endpoints.

## Type Parameters

### T

`T` = [`UserInfo`](../interfaces/UserInfo.md)

## Constructors

### Constructor

```ts
new FusionAuthService<T>(
   config,
   platformId,
   ngZone,
appRef): FusionAuthService<T>;
```

Defined in: [fusion-auth.service.ts:29](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L29)

#### Parameters

##### config

[`FusionAuthConfig`](../interfaces/FusionAuthConfig.md)

##### platformId

`Object`

##### ngZone

`NgZone`

##### appRef

`ApplicationRef`

#### Returns

`FusionAuthService`\<`T`\>

## Properties

### isLoggedIn$

```ts
isLoggedIn$: Observable<boolean>;
```

Defined in: [fusion-auth.service.ts:68](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L68)

An observable representing whether the user is logged in.

---

### isLoggedInSignal

```ts
isLoggedInSignal: Signal<boolean>;
```

Defined in: [fusion-auth.service.ts:73](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L73)

A Signal representing whether the user is logged in.

## Methods

### dpopFetch()

```ts
dpopFetch(input, init?): Promise<Response>;
```

Defined in: [fusion-auth.service.ts:177](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L177)

DPoP mode `fetch()` wrapper that automatically attaches DPoP proof
headers.

#### Parameters

##### input

`URL` \| `RequestInfo`

##### init?

`RequestInit`

#### Returns

`Promise`\<`Response`\>

#### Throws

if called when `useDpop` is not enabled.

---

### generateProof()

```ts
generateProof(
   htu,
   htm,
   accessToken?,
nonce?): Promise<string>;
```

Defined in: [fusion-auth.service.ts:189](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L189)

Returns a signed DPoP proof JWT for use with axios or other
HTTP libraries that can't use [dpopFetch](#dpopfetch).

#### Parameters

##### htu

`string`

##### htm

`string`

##### accessToken?

`string`

##### nonce?

`string`

#### Returns

`Promise`\<`string`\>

#### Throws

if called when `useDpop` is not enabled.

---

### getAccessToken()

```ts
getAccessToken(): string | null;
```

Defined in: [fusion-auth.service.ts:202](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L202)

Returns the stored DPoP access token, or `null` if not logged in.

#### Returns

`string` \| `null`

#### Throws

if called when `useDpop` is not enabled.

---

### getUserInfo()

```ts
getUserInfo<T>(): Promise<T>;
```

Defined in: [fusion-auth.service.ts:131](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L131)

Fetches userInfo from the 'me' endpoint.

#### Type Parameters

##### T

`T`

#### Returns

`Promise`\<`T`\>

#### Throws

- if an error occurred while fetching.

---

### getUserInfoObservable()

```ts
getUserInfoObservable(callbacks?): Observable<T>;
```

Defined in: [fusion-auth.service.ts:103](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L103)

Returns an observable request that fetches userInfo, and catches error.

#### Parameters

##### callbacks?

###### onBegin?

() => `void`

###### onDone?

() => `void`

#### Returns

`Observable`\<`T`\>

---

### initAutoRefresh()

```ts
initAutoRefresh(): void;
```

Defined in: [fusion-auth.service.ts:92](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L92)

Initializes automatic access token refreshing.
This is handled automatically if the SDK is configured with `shouldAutoRefresh`.

#### Returns

`void`

---

### isLoggedIn()

```ts
isLoggedIn(): boolean;
```

Defined in: [fusion-auth.service.ts:76](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L76)

A function that returns whether the user is logged in. This returned value is non-observable.

#### Returns

`boolean`

---

### logout()

```ts
logout(): void;
```

Defined in: [fusion-auth.service.ts:160](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L160)

Initiates logout flow.

#### Returns

`void`

---

### manageAccount()

```ts
manageAccount(): void;
```

Defined in: [fusion-auth.service.ts:168](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L168)

Redirects to [self service account management](https://fusionauth.io/docs/lifecycle/manage-users/account-management/)
Self service account management is only available in FusionAuth paid plans.

#### Returns

`void`

---

### refreshToken()

```ts
refreshToken(): Promise<Response>;
```

Defined in: [fusion-auth.service.ts:84](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L84)

Refreshes the access token a single time.
Automatic token refreshing can be enabled if the SDK is configured with `shouldAutoRefresh`.

#### Returns

`Promise`\<`Response`\>

---

### startLogin()

```ts
startLogin(state?): void;
```

Defined in: [fusion-auth.service.ts:145](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L145)

Initiates login flow.

#### Parameters

##### state?

`string`

Optional value to be echoed back to the SDK upon redirect.

#### Returns

`void`

---

### startRegistration()

```ts
startRegistration(state?): void;
```

Defined in: [fusion-auth.service.ts:153](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ee8adbc65b4bc7586f80efa86002158c90d78a7e/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/fusion-auth.service.ts#L153)

Initiates register flow.

#### Parameters

##### state?

`string`

Optional value to be echoed back to the SDK upon redirect.

#### Returns

`void`
