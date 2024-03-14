# Components

The following components are exported by the SDK:

## FusionAuthLoginButton

A pre-styled button component that calls [login](context.md#login-function) when clicked. The content of the button can be customized by passing children to the component. The default content is "Login".

### Props

| Name  | Type                | Description                                                               |
| ----- | ------------------- | ------------------------------------------------------------------------- |
| state | `string` (optional) | State value that is supplied to the backend server when `login` is called |

## FusionAuthLogoutButton

A pre-styled button component that calls [logout](context.md#logout-function) when clicked. The content of the button can be customized by passing children to the component. The default content is "Logout".

## FusionAuthRegisterButton

A pre-styled button component that calls [register](context.md#register-function) when clicked. The content of the button can be customized by passing children to the component. The default content is "Register".

### Props

| Name  | Type                | Description                                                                  |
| ----- | ------------------- | ---------------------------------------------------------------------------- |
| state | `string` (optional) | State value that is supplied to the backend server when `register` is called |

## RequireAuth

A component that will only render its children if the user is authenticated, and optionally if they match one of the given roles.

### Props

| Name     | Type                            | Description                                                   |
| -------- | ------------------------------- | ------------------------------------------------------------- |
| withRole | `string \| string[]` (optional) | A role the user must have in order for the children to render |

## RequireAnonymous

A component that will only render its children if the user is not authenticated.
