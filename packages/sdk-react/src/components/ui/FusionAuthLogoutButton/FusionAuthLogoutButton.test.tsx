import { screen, render, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { FusionAuthLogoutButton } from './';
import { FusionAuthProvider } from '#components/providers/FusionAuthProvider';
import { mockUseFusionAuth } from '#testing-tools/mocks/mockUseFusionAuth';
import { TEST_CONFIG } from '#testing-tools/mocks/testConfig';

describe('FusionAuthLogoutButton', () => {
  test('Logout button will call the useFusionAuth hook', () => {
    const startLogout = vi.fn();
    mockUseFusionAuth({ startLogout });

    render(
      <FusionAuthProvider {...TEST_CONFIG}>
        <FusionAuthLogoutButton />
      </FusionAuthProvider>,
    );

    fireEvent.click(screen.getByText('Logout'));

    expect(startLogout).toHaveBeenCalled();
  });
});
