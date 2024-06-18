import { FC } from 'react';
import classNames from 'classnames';

import { useFusionAuth } from '#components/providers/FusionAuthProvider';
import styles from '#styles/button.module.scss';

interface Props {
  className?: string;
}

export const FusionAuthAccountButton: FC<Props> = ({ className }) => {
  const { manageAccount } = useFusionAuth();

  return (
    <button
      className={classNames(styles.fusionAuthButton, className)}
      type="button"
      onClick={manageAccount}
    >
      Manage Account
    </button>
  );
};
