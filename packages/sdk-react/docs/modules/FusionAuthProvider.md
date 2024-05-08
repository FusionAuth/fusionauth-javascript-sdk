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

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:10](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/e25d30bffe14d8afa7d39c719992b655df59a45d/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L10)

---

### useFusionAuth

▸ **useFusionAuth**(): [`FusionAuthProviderContext`](../interfaces/FusionAuthProviderContext.FusionAuthProviderContext.md)

A hook that returns `FusionAuthProviderContext`

#### Returns

[`FusionAuthProviderContext`](../interfaces/FusionAuthProviderContext.FusionAuthProviderContext.md)

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:65](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/e25d30bffe14d8afa7d39c719992b655df59a45d/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L65)
