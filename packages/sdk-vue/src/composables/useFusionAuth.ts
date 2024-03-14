import { inject } from 'vue';
import { fusionAuthKey } from '../injectionSymbols';
import type { FusionAuth } from '../types';

export const useFusionAuth = (): FusionAuth => {
  const fusionAuth = inject(fusionAuthKey);

  if (!fusionAuth) {
    throw new Error(
      'No FusionAuth instance found. Did you forget to call Vue.use(FusionAuthVuePlugin)?',
    );
  }
  return inject(fusionAuthKey)!;
};
