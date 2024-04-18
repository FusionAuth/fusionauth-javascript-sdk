[@fusionauth/react-sdk](../README.md) / [Modules](../modules.md) / FusionAuthProvider

# Module: FusionAuthProvider

## Table of contents

### Functions

- [FusionAuthProvider](FusionAuthProvider.md#fusionauthprovider)
- [useFusionAuth](FusionAuthProvider.md#usefusionauth)

## Functions

### FusionAuthProvider

▸ **FusionAuthProvider**(`props`, `context?`): `ReactNode`

#### Parameters

| Name       | Type                                                                                                                             |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `props`    | [`FusionAuthProviderConfig`](../interfaces/FusionAuthProviderConfig.FusionAuthProviderConfig.md) & \{ `children?`: `ReactNode` } |
| `context?` | `any`                                                                                                                            |

#### Returns

`ReactNode`

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:9](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/70d5b677cad1a2b11d090d5c6c3e06a3a491f098/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L9)

---

### useFusionAuth

▸ **useFusionAuth**(): [`FusionAuthProviderContext`](../interfaces/FusionAuthProviderContext.FusionAuthProviderContext.md)

A hook that returns `FusionAuthProviderContext`

#### Returns

[`FusionAuthProviderContext`](../interfaces/FusionAuthProviderContext.FusionAuthProviderContext.md)

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:64](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/70d5b677cad1a2b11d090d5c6c3e06a3a491f098/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L64)
