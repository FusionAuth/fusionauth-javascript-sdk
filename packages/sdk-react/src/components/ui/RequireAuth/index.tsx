import { FC, PropsWithChildren } from 'react';
import { useFusionAuth } from '#components/providers/FusionAuthProvider';

interface RequireAuthProps extends PropsWithChildren {
  /** Children are only rendered for user with a matching role when this prop is specified. */
  withRole?: string | string[];
}

/** Only renders children when user is authenticated. */
export const RequireAuth: FC<RequireAuthProps> = ({ withRole, children }) => {
  const { userInfo, isLoggedIn } = useFusionAuth();

  // Check if the user has the required role
  // withRole can be a string or an array of strings
  const hasRole = withRole
    ? ([] as string[])
        .concat(withRole)
        .some(role => userInfo?.roles?.includes(role))
    : true;

  const isAuthorized = isLoggedIn && hasRole;

  return <>{isAuthorized && children}</>;
};
