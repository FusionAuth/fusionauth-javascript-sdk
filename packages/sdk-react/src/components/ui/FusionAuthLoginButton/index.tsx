import { FC } from 'react';
import classNames from 'classnames';

import { useFusionAuth } from '#components/providers/FusionAuthProvider';
import styles from '#styles/button.module.scss';

interface FusionAuthLoginButtonProps {
  /** Optional string value that will be passed to `onRedirect` after login. */
  state?: string;
  /** Label displayed by the button. Defaults to "Login". */
  text?: string;
  className?: string;
}

/** Calls the `startLogin` method from `FusionAuthContext`. */
export const FusionAuthLoginButton: FC<FusionAuthLoginButtonProps> = ({
  state,
  text,
  className,
}) => {
  const { startLogin } = useFusionAuth();

  return (
    <button
      className={classNames(styles.fusionAuthButton, className)}
      type="button"
      onClick={() => startLogin(state)}
    >
      {text ?? 'Login'}
    </button>
  );
};
