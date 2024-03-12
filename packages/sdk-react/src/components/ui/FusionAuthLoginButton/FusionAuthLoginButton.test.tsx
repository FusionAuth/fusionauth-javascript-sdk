import { screen, render, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { FusionAuthLoginButton } from './';
import { FusionAuthProvider } from '../../providers/FusionAuthProvider';
import { mockUseFusionAuth } from '../../../testing-tools/mocks/mockUseFusionAuth';
import { TEST_CONFIG } from '../../../testing-tools/mocks/testConfig';

describe('FusionAuthLoginButton', () => {
  test('Login button will call the useFusionAuth hook', () => {
    const login = vi.fn();
    mockUseFusionAuth({ login });

    const stateValue = 'state-value-for-login';
    render(
      <FusionAuthProvider {...TEST_CONFIG}>
        <FusionAuthLoginButton state={stateValue} />
      </FusionAuthProvider>,
    );

    fireEvent.click(screen.getByText('Login'));
    expect(login).toHaveBeenCalledWith(stateValue);
  });
});
