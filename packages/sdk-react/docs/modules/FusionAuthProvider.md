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

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:9](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L9)

---

### useFusionAuth

▸ **useFusionAuth**(): [`FusionAuthProviderContext`](../interfaces/FusionAuthProviderContext.FusionAuthProviderContext.md)

A hook that returns and object containing [`FusionAuthProviderContext`](#interfaces/FusionAuthProviderContext.FusionAuthProviderContext.md)

#### Returns

[`FusionAuthProviderContext`](../interfaces/FusionAuthProviderContext.FusionAuthProviderContext.md)

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:64](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/cac50ddbffcd76ceead19379f380c6a35462497e/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L64)