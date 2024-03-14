import { InjectionKey } from 'vue';
import type { FusionAuth } from './types.ts';

export const fusionAuthKey = Symbol('fusionAuth') as InjectionKey<FusionAuth>;
