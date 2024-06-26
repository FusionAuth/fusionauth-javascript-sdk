[@fusionauth/vue-sdk](README.md) / Exports

# @fusionauth/vue-sdk

## Table of contents

### References

- [FusionAuthAccountButton](modules.md#fusionauthaccountbutton)
- [FusionAuthLogoutButton](modules.md#fusionauthlogoutbutton)
- [FusionAuthRegisterButton](modules.md#fusionauthregisterbutton)
- [RequireAnonymous](modules.md#requireanonymous)
- [RequireAuth](modules.md#requireauth)

### Namespaces

- [FusionAuthLoginButton](modules/FusionAuthLoginButton.md)

### Interfaces

- [FusionAuth](interfaces/FusionAuth.md)
- [FusionAuthConfig](interfaces/FusionAuthConfig.md)
- [UserInfo](interfaces/UserInfo.md)

### Variables

- [default](modules.md#default)
- [fusionAuthKey](modules.md#fusionauthkey)

### Functions

- [createFusionAuth](modules.md#createfusionauth)
- [useFusionAuth](modules.md#usefusionauth)

## Other

### FusionAuthAccountButton

Renames and re-exports [FusionAuthLoginButton](modules/FusionAuthLoginButton.md)

---

### FusionAuthLogoutButton

Renames and re-exports [FusionAuthLoginButton](modules/FusionAuthLoginButton.md)

---

### FusionAuthRegisterButton

Renames and re-exports [FusionAuthLoginButton](modules/FusionAuthLoginButton.md)

---

### RequireAnonymous

Renames and re-exports [FusionAuthLoginButton](modules/FusionAuthLoginButton.md)

---

### RequireAuth

Renames and re-exports [FusionAuthLoginButton](modules/FusionAuthLoginButton.md)

---

### fusionAuthKey

• `Const` **fusionAuthKey**: typeof [`fusionAuthKey`](modules.md#fusionauthkey)

#### Defined in

[src/injectionSymbols.ts:1](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/injectionSymbols.ts#L1)

---

### createFusionAuth

▸ **createFusionAuth**\<`T`\>(`config`): [`FusionAuth`](interfaces/FusionAuth.md)\<`T`\>

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `T`  | [`UserInfo`](interfaces/UserInfo.md) |

#### Parameters

| Name     | Type                                                 |
| :------- | :--------------------------------------------------- |
| `config` | [`FusionAuthConfig`](interfaces/FusionAuthConfig.md) |

#### Returns

[`FusionAuth`](interfaces/FusionAuth.md)\<`T`\>

#### Defined in

[src/createFusionAuth/createFusionAuth.ts:7](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/createFusionAuth/createFusionAuth.ts#L7)

---

### useFusionAuth

▸ **useFusionAuth**\<`T`\>(): [`FusionAuth`](interfaces/FusionAuth.md)\<`T`\>

#### Type parameters

| Name | Type                                 |
| :--- | :----------------------------------- |
| `T`  | [`UserInfo`](interfaces/UserInfo.md) |

#### Returns

[`FusionAuth`](interfaces/FusionAuth.md)\<`T`\>

#### Defined in

[src/composables/useFusionAuth.ts:5](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/composables/useFusionAuth.ts#L5)

## Plugin

### default

• `Const` **default**: `Object`

Installation method for the FusionAuthVuePlugin.

**`Param`**

The Vue app instance.

**`Param`**

The configuration options for the plugin or an object containing a FusionAuth instance.

**`Throws`**

Will throw an error if the required options are missing.

#### Type declaration

| Name      | Type                                                                                                                           |
| :-------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `install` | (`app`: `App`\<`any`\>, `options`: [`FusionAuthConfig`](interfaces/FusionAuthConfig.md) \| `FusionAuthInstantiated`) => `void` |

#### Defined in

[src/FusionAuthVuePlugin.ts:17](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/02b46e2174ba0f4804f6b5ef004ac88414902cc3/packages/sdk-vue/src/FusionAuthVuePlugin.ts#L17)
