import { FC, PropsWithChildren } from 'react';
import { useFusionAuth } from '#components/providers/FusionAuthProvider';

interface Props extends PropsWithChildren {
  withRole?: string | string[];
}

export const RequireAuth: FC<Props> = ({ withRole, children }) => {
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
