# FusionAuth SDK for Vanilla JavaScript

This package provides a FusionAuth SDK for vanilla JavaScript with web components. It includes the following web components:

- `fa-account`: A button to redirect to the user's account management page.
- `fa-login`: A button component that will redirect the browser to the /app/login endpoint and start the OAuth flow.
- `fa-logout`: A button that will redirect the browser to the /app/logout endpoint.
- `fa-register`: A button that will redirect the browser to the /app/register endpoint.

## Installation

To install the package, use npm or yarn:

```bash
npm install @fusionauth/sdk-vanilla
```

or

```bash
yarn add @fusionauth/sdk-vanilla
```

## Usage

### Importing the Components

To use the web components in your project, import them as follows:

```javascript
import { FaAccount, FaLogin, FaLogout, FaRegister } from '@fusionauth/sdk-vanilla';
```

### Using the Components

You can use the web components in your HTML as follows:

```html
<fa-account></fa-account>
<fa-login></fa-login>
<fa-logout></fa-logout>
<fa-register></fa-register>
```

### Configuring the FusionAuthService

To configure the `FusionAuthService`, use the `configure` method:

```javascript
import { FusionAuthService } from '@fusionauth/sdk-vanilla';

const fusionAuthService = FusionAuthService.configure({
  clientId: 'your-client-id',
  redirectUri: 'your-redirect-uri',
  serverUrl: 'your-server-url',
});
```

## Examples

Here is an example of how to use the `fa-login` component:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FusionAuth SDK Vanilla Example</title>
  <script type="module">
    import { FaLogin } from '@fusionauth/sdk-vanilla';

    // Configure the FusionAuthService
    const fusionAuthService = FusionAuthService.configure({
      clientId: 'your-client-id',
      redirectUri: 'your-redirect-uri',
      serverUrl: 'your-server-url',
    });
  </script>
</head>
<body>
  <fa-login></fa-login>
</body>
</html>
```

## License

This package is licensed under the Apache License, Version 2.0. See the [LICENSE](LICENSE) file for more information.
