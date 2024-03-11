import { FC, PropsWithChildren } from 'react';
import { useFusionAuth } from '#components/providers/FusionAuthProvider';

export const Unauthenticated: FC<PropsWithChildren> = props => {
    const { isAuthenticated } = useFusionAuth();

    return isAuthenticated ? null : <>{props.children}</>;
};
