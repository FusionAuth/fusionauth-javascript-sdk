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

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:9](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6f1de893735ee6b106ed805dd8ba2011e08e1cfc/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L9)

---

### useFusionAuth

▸ **useFusionAuth**(): [`FusionAuthProviderContext`](../interfaces/FusionAuthProviderContext.FusionAuthProviderContext.md)

A hook that returns `FusionAuthProviderContext`

#### Returns

[`FusionAuthProviderContext`](../interfaces/FusionAuthProviderContext.FusionAuthProviderContext.md)

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:64](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/6f1de893735ee6b106ed805dd8ba2011e08e1cfc/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L64)
