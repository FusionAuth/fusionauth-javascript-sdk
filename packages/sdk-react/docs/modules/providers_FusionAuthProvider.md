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

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:23](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/78cf20d36c68af6e4c45d9297c7e20d85651f669/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L23)

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

[packages/sdk-react/src/components/providers/FusionAuthProvider.tsx:154](https://github.com/FusionAuth/fusionauth-javascript-sdk/blob/78cf20d36c68af6e4c45d9297c7e20d85651f669/packages/sdk-react/src/components/providers/FusionAuthProvider.tsx#L154)
