import { screen, render, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { FusionAuthAccountButton } from '.';
import { FusionAuthProvider } from '../../providers/FusionAuthProvider';
import { mockUseFusionAuth } from '../../../testing-tools/mocks/mockUseFusionAuth';
import { TEST_CONFIG } from '../../../testing-tools/mocks/testConfig';

describe('FusionAuthAccountButton', () => {
  test('Login button will call the useFusionAuth hook', () => {
    const startLogin = vi.fn();
    mockUseFusionAuth({ startLogin });

    const stateValue = 'state-value-for-login';
    render(
      <FusionAuthProvider {...TEST_CONFIG}>
        <FusionAuthAccountButton state={stateValue} />
      </FusionAuthProvider>,
    );

    fireEvent.click(screen.getByText('Manage Account'));
    expect(startLogin).toHaveBeenCalledWith(stateValue);
  });
});
