# FusionAuthVuePlugin

## Usage

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import FusionAuthVuePlugin from '@fusionauth/vue-sdk';

const app = createApp(App);

app.use(FusionAuthVuePlugin, {
  clientId: '',
  serverUrl: '',
  redirectUri: '',
});

app.mount('#app');
```

If you want to use the pre-styled buttons, also import the css file:

```typescript
import '@fusionauth/vue-sdk/dist/style.css';
```

### Properties

| Name                           | Type                | Description                                                                       | Example                                |
| ------------------------------ | ------------------- | --------------------------------------------------------------------------------- | -------------------------------------- |
| clientID                       | `string`            | The client ID of your FusionAuth application                                      | `90ba1caf-c0c1-b30a-af38-3ed438df9fc0` |
| serverUrl                      | `string`            | The URL to your server which will perform the token exchange                      | `https://localhost:9000`               |
| redirectUri                    | `string`            | The URL to redirect to from FusionAuth. Typically your React application.         | `https://localhost:3000`               |
| accessTokenExpireWindow        | `number` (optional) | Optional number of milliseconds from access token expiration to make network call | `30000` (default)                      |
| autoRefreshSecondsBeforeExpiry | `number` (optional) | Optional number of seconds before access token expiration to refresh token        | `undefined`                            |

#### Optional Route Properties

If you set up your own server to do token exchange with different paths, set these values.

| Name             | Type     | Description                                            | Example              |
| ---------------- | -------- | ------------------------------------------------------ | -------------------- |
| loginPath        | `string` | Server login endpoint. Initiates oauth login.          | `/app/login`         |
| logoutPath       | `string` | Server logout endpoint                                 | `/app/logout`        |
| registerPath     | `string` | Server register endpoint. Initiates oauth register.    | `/app/register`      |
| tokenRefreshPath | `string` | Server token refresh endpoint. Refreshes access_token. | `/app/token-refresh` |
| mePath           | `string` | Server userinfo endpoint                               | `/app/me`            |
