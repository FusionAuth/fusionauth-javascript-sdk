import { FC } from 'react';
import { useFusionAuth } from '#components/providers/FusionAuthProvider';
import styles from '#styles/button.module.scss';
import classNames from 'classnames';

interface Props {
  state?: string;
  text?: string;
  className?: string;
}

/** Calls the `startRegister` method from `useFusionAuth`. */
export const FusionAuthRegisterButton: FC<Props> = ({
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
