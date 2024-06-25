import { FC } from 'react';
import { useFusionAuth } from '#components/providers/FusionAuthProvider';
import styles from '#styles/button.module.scss';
import classNames from 'classnames';

interface FusionAuthLogoutButtonProps {
  /** Label displayed by the button. Defaults to "Logout". */
  text?: string;
  className?: string;
}

/** Calls the `startLogout` method from `FusionAuthProviderContext`. */
export const FusionAuthLogoutButton: FC<FusionAuthLogoutButtonProps> = ({
  text,
  className,
}) => {
  const { startLogout } = useFusionAuth();

  return (
    <button
      className={classNames(styles.fusionAuthButton, className)}
      type="button"
      onClick={() => startLogout()}
    >
      {text ?? 'Logout'}
    </button>
  );
};
