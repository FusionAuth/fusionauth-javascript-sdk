[**@fusionauth/angular-sdk**](../README.md)

---

[@fusionauth/angular-sdk](../globals.md) / FusionAuthConfig

# Interface: FusionAuthConfig

Defined in: [types.ts:4](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L4)

Config for FusionAuth Angular SDK

## Properties

### autoRefreshSecondsBeforeExpiry?

```ts
optional autoRefreshSecondsBeforeExpiry?: number;
```

Defined in: [types.ts:38](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L38)

The number of seconds before the access token expiry when the auto refresh functionality kicks in if enabled. Default is 10.

---

### clientId

```ts
clientId: string;
```

Defined in: [types.ts:13](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L13)

The client id of the application.

---

### dpopTokenStorage?

```ts
optional dpopTokenStorage?: "localStorage" | "memory";
```

Defined in: [types.ts:86](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L86)

Token storage location in DPoP mode. Only meaningful when `useDpop: true`.
Defaults to `'localStorage'`.

---

### loginPath?

```ts
optional loginPath?: string;
```

Defined in: [types.ts:53](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L53)

The path to the login endpoint.

---

### logoutPath?

```ts
optional logoutPath?: string;
```

Defined in: [types.ts:63](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L63)

The path to the logout endpoint.

---

### mePath?

```ts
optional mePath?: string;
```

Defined in: [types.ts:73](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L73)

The path to the me endpoint.

---

### onAutoRefreshFailure?

```ts
optional onAutoRefreshFailure?: (error) => void;
```

Defined in: [types.ts:48](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L48)

Callback to be invoked if a request to refresh the access token fails during autorefresh.

#### Parameters

##### error

`Error`

#### Returns

`void`

---

### onRedirect?

```ts
optional onRedirect?: (state?) => void;
```

Defined in: [types.ts:43](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L43)

Callback function to be invoked with the `state` value upon redirect from login or register.

#### Parameters

##### state?

`string`

#### Returns

`void`

---

### postLogoutRedirectUri?

```ts
optional postLogoutRedirectUri?: string;
```

Defined in: [types.ts:23](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L23)

The redirect URI for post-logout. Defaults the provided `redirectUri`.

---

### redirectUri

```ts
redirectUri: string;
```

Defined in: [types.ts:18](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L18)

The redirect URI of the application.

---

### registerPath?

```ts
optional registerPath?: string;
```

Defined in: [types.ts:58](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L58)

The path to the register endpoint.

---

### scope?

```ts
optional scope?: string;
```

Defined in: [types.ts:28](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L28)

The OAuth2 scope parameter passed to the `/oauth2/authorize` endpoint. If not specified fusionauth will default this to `openid offline_access`.

---

### serverUrl

```ts
serverUrl: string;
```

Defined in: [types.ts:8](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L8)

The URL of the server that performs the token exchange.

---

### shouldAutoRefresh?

```ts
optional shouldAutoRefresh?: boolean;
```

Defined in: [types.ts:33](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L33)

Enables automatic token refreshing. Defaults to false.

---

### tokenRefreshPath?

```ts
optional tokenRefreshPath?: string;
```

Defined in: [types.ts:68](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L68)

The path to the token refresh endpoint.

---

### useDpop?

```ts
optional useDpop?: boolean;
```

Defined in: [types.ts:80](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/2d9af72c9bed501cbc80b584411e66e73a4cc15c/packages/sdk-angular/projects/fusionauth-angular-sdk/src/lib/types.ts#L80)

Opt-in to DPoP mode. When `true`, the SDK calls FusionAuth endpoints
directly and stores tokens in JavaScript-accessible storage instead of
relying on the Hosted Backend's HttpOnly cookies. Defaults to `false`.
