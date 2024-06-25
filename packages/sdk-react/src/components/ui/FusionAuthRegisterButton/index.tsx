import { FC } from 'react';
import { useFusionAuth } from '#components/providers/FusionAuthProvider';
import styles from '#styles/button.module.scss';
import classNames from 'classnames';

interface FusionAuthRegisterButtonProps {
  /** Optional string value that will be passed to `onRedirect` after register. */
  state?: string;
  /** Label displayed by the button. Defaults to "Register Now". */
  text?: string;
  className?: string;
}

/** Calls the `startRegister` method from `FusionAuthProviderContext`. */
export const FusionAuthRegisterButton: FC<FusionAuthRegisterButtonProps> = ({
  state,
  text,
  className,
}) => {
  const { startRegister } = useFusionAuth();

  return (
    <button
      className={classNames(styles.fusionAuthButton, className)}
      type="button"
      onClick={() => startRegister(state)}
    >
      {text ?? 'Register Now'}
    </button>
  );
};
