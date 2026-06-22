[@fusionauth/react-sdk](../README.md) / [Modules](../modules.md) / providers/FusionAuthProvider

# Module: providers/FusionAuthProvider

## Table of contents

### Functions

- [FusionAuthProvider](providers_FusionAuthProvider.md#fusionauthprovider)
- [useFusionAuth](providers_FusionAuthProvider.md#usefusionauth)

## Functions

### FusionAuthProvider

▸ **FusionAuthProvider**\<`T`\>(`props`): `Element`

#### Type parameters

| Name | Type       |
| :--- | :--------- |
| `T`  | `UserInfo` |

#### Parameters

| Name    | Type                                                                                                                                       |
| :------ | :----------------------------------------------------------------------------------------------------------------------------------------- |
| `props` | \{ `children?`: `ReactNode` } & [`FusionAuthProviderConfig`](../interfaces/providers_FusionAuthProviderConfig.FusionAuthProviderConfig.md) |

#### Returns

`Element`

#### Defined in

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:21](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/63efa2d5360c2b7e1392ffa730dac8f5a0bc8e19/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L21)

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

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:122](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/63efa2d5360c2b7e1392ffa730dac8f5a0bc8e19/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L122)
