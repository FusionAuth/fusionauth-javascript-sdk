import { screen, render, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { FusionAuthAccountButton } from '.';
import { FusionAuthProvider } from '../../providers/FusionAuthProvider';
import { mockUseFusionAuth } from '../../../testing-tools/mocks/mockUseFusionAuth';
import { TEST_CONFIG } from '../../../testing-tools/mocks/testConfig';

describe('FusionAuthAccountButton', () => {
  test('Manage Account button will call the useFusionAuth hook', () => {
    const manageAccount = vi.fn();
    mockUseFusionAuth({ manageAccount });

    render(
      <FusionAuthProvider {...TEST_CONFIG}>
        <FusionAuthAccountButton />
      </FusionAuthProvider>,
    );

    fireEvent.click(screen.getByText('Manage Account'));
    expect(manageAccount).toHaveBeenCalled();
  });
});
