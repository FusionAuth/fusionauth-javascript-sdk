import { screen, render, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { FusionAuthRegisterButton } from '#components/ui/FusionAuthRegisterButton';
import { FusionAuthProvider } from '#components/providers/FusionAuthProvider';
import { mockUseFusionAuth } from '#testing-tools/mocks/mockUseFusionAuth';
import { TEST_CONFIG } from '#testing-tools/mocks/testConfig';

describe('FusionAuthRegisterButton', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Register button will call the useFusionAuth hook', async () => {
    const startRegister = vi.fn();

    mockUseFusionAuth({ startRegister });

    const stateValue = 'state-value-for-register';
    render(
      <FusionAuthProvider {...TEST_CONFIG}>
        <FusionAuthRegisterButton state={stateValue} />
      </FusionAuthProvider>,
    );

    fireEvent.click(screen.getByText('Register Now'));

    expect(startRegister).toHaveBeenCalledWith(stateValue);
  });
});
