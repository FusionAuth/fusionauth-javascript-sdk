import { FC, PropsWithChildren } from 'react';
import { useFusionAuth } from '#components/providers/FusionAuthProvider';

/** Only renders children when user is unauthenticated. */
export const Unauthenticated: FC<PropsWithChildren> = props => {
  const { isLoggedIn } = useFusionAuth();

  return isLoggedIn ? null : <>{props.children}</>;
};
