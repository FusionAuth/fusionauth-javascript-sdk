import { inject } from 'vue';
import { fusionAuthKey } from '#/injectionSymbols';
import type { FusionAuth, UserInfo } from '#/types';

export const useFusionAuth = <T extends FusionAuth<UserInfo>>(): FusionAuth => {
  const fusionAuth = inject(fusionAuthKey);

  if (!fusionAuth) {
    throw new Error(
      'No FusionAuth instance found. Did you forget to call Vue.use(FusionAuthVuePlugin)?',
    );
  }
  return fusionAuth as T;
};
