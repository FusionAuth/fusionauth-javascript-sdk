[@fusionauth/react-sdk](../README.md) / [Modules](../modules.md) / providers/FusionAuthProvider

# Module: providers/FusionAuthProvider

## Table of contents

### Functions

- [FusionAuthProvider](providers_FusionAuthProvider.md#fusionauthprovider)
- [useFusionAuth](providers_FusionAuthProvider.md#usefusionauth)

## Functions

### FusionAuthProvider

▸ **FusionAuthProvider**\<`T`\>(`«destructured»`): `Element`

#### Type parameters

| Name | Type       |
| :--- | :--------- |
| `T`  | `UserInfo` |

#### Parameters

| Name             | Type                                                                                                                                       |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `«destructured»` | \{ `children?`: `ReactNode` } & [`FusionAuthProviderConfig`](../interfaces/providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md) |

#### Returns

`Element`

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:15](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ce690f3d040e390c8fcdaa133e0c4df7f0050404/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L15)

---

### useFusionAuth

▸ **useFusionAuth**\<`T`\>(): [`FusionAuthProviderContext`](../interfaces/providers_FusionAuthProviderContext.FusionAuthProviderContext.md)\<`T`\>

A hook that returns `FusionAuthProviderContext`

#### Type parameters

| Name | Type       |
| :--- | :--------- |
| `T`  | `UserInfo` |

#### Returns

[`FusionAuthProviderContext`](../interfaces/providers_FusionAuthProviderContext.FusionAuthProviderContext.md)\<`T`\>

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:68](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/ce690f3d040e390c8fcdaa133e0c4df7f0050404/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L68)
