import { FC } from 'react';
import classNames from 'classnames';

import { useFusionAuth } from '#components/providers/FusionAuthProvider';
import styles from '#styles/button.module.scss';

interface Props {
    state?: string;
    text?: string;
    className?: string;
}

export const FusionAuthLoginButton: FC<Props> = ({
    state,
    text,
    className,
}) => {
    const { login } = useFusionAuth();

    return (
        <button
            className={classNames(styles.fusionAuthButton, className)}
            type="button"
            onClick={() => login(state ?? '')}
        >
            {text ?? 'Login'}
        </button>
    );
};
