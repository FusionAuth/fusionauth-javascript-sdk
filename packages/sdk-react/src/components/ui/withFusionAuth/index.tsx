import type { ComponentType } from 'react';

import { FusionAuthContext } from '#components/providers/FusionAuthProvider';
import { FusionAuthProviderContext } from '#/components/providers/FusionAuthProviderContext';

export interface WithFusionAuthProps {
  fusionAuth: FusionAuthProviderContext;
}

export const withFusionAuth = <
  Props extends WithFusionAuthProps = WithFusionAuthProps,
>(
  Component: ComponentType<Props>,
) => {
  const displayName = Component.displayName;

  const FusionAuthComponent = (
    props: Omit<Props, keyof WithFusionAuthProps>,
  ) => (
    <FusionAuthContext.Consumer>
      {(fusionAuth: FusionAuthProviderContext) => (
        <Component {...(props as Props)} fusionAuth={fusionAuth} />
      )}
    </FusionAuthContext.Consumer>
  );

  FusionAuthComponent.displayName = displayName;

  return FusionAuthComponent;
};
