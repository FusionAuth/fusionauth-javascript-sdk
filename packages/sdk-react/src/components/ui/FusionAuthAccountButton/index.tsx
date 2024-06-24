import { FC } from 'react';
import classNames from 'classnames';

import { useFusionAuth } from '#components/providers/FusionAuthProvider';
import styles from '#styles/button.module.scss';

type FusionAuthAccountButtonProps = {
  /** Label displayed by the button. Defaults to "Manage Account". */
  text?: string;
  className?: string;
};

/** Calls the `manageAccount` method from `FusionAuthContext`. */
export const FusionAuthAccountButton: FC<FusionAuthAccountButtonProps> = ({
  className,
  text,
}) => {
  const { manageAccount } = useFusionAuth();

  return (
    <button
      className={classNames(styles.fusionAuthButton, className)}
      type="button"
      onClick={manageAccount}
    >
      {text ?? 'Manage Account'}
    </button>
  );
};
