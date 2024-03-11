# Composables

## useFusionAuth

To use the composable, call `useFusionAuth` in your setup function. It will return the `FusionAuth` object.

```typescript
import { useFusionAuth, type UserInfo } from '@fusionauth/vue-sdk';
const fusionAuth = useFusionAuth();
```

### Methods

#### getUserInfo

A function that will return the user info if authenticated.

#### isLoggedIn

A function that will return a boolean indicating whether the user is authenticated.

#### login

A function that will redirect to FusionAuth's login page and then back to the `redirectUri` provided to the `FusionAuthVuePlugin`.

##### Arguments

| Name  | Type                | Description                                                           |
| ----- | ------------------- | --------------------------------------------------------------------- |
| state | `string` (optional) | An optional state parameter that will be passed back to your Vue app. |

#### logout

A function that will redirect to FusionAuth's logout page and then back to the `redirectUri` provided to the `FusionAuthVuePlugin`.

#### refreshToken

A function that will refresh the access token when called. It observes the `accessTokenExpireWindow` value to prevent needless refreshes.

#### register

A function that will redirect to FusionAuth's register page and then back to the `redirectUri` provided to the `FusionAuthVuePlugin`.

##### Arguments

| Name  | Type                | Description                                                           |
| ----- | ------------------- | --------------------------------------------------------------------- |
| state | `string` (optional) | An optional state parameter that will be passed back to your Vue app. |
