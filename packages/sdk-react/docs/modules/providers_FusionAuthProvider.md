[@fusionauth/react-sdk](../README.md) / [Modules](../modules.md) / providers/FusionAuthProvider

# Module: providers/FusionAuthProvider

## Table of contents

### Functions

- [FusionAuthProvider](providers_FusionAuthProvider.md#fusionauthprovider)
- [useFusionAuth](providers_FusionAuthProvider.md#usefusionauth)

## Functions

### FusionAuthProvider

▸ **FusionAuthProvider**(`props`, `context?`): `ReactNode`

#### Parameters

| Name       | Type                                                                                                                                       |
| :--------- | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `props`    | [`FusionAuthProviderConfig`](../interfaces/providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md) & \{ `children?`: `ReactNode` } |
| `context?` | `any`                                                                                                                                      |

#### Returns

`ReactNode`

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:15](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/546896fe40aeab4bf379a067a721414ce99ca372/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L15)

---

### useFusionAuth

▸ **useFusionAuth**(): [`FusionAuthProviderContext`](../interfaces/providers_FusionAuthProviderContext.FusionAuthProviderContext.md)

A hook that returns `FusionAuthProviderContext`

#### Returns

[`FusionAuthProviderContext`](../interfaces/providers_FusionAuthProviderContext.FusionAuthProviderContext.md)

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:73](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/546896fe40aeab4bf379a067a721414ce99ca372/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L73)
