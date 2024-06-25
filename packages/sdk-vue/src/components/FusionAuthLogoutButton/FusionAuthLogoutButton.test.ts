import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import FusionAuthLogoutButton from './FusionAuthLogoutButton.vue';
import { getMockFusionAuth } from '../../utilsForTests';

const label = 'logout button label';
const setup = () => {
  const { key, mockedValues } = getMockFusionAuth({});
  return [
    shallowMount(FusionAuthLogoutButton, {
      global: {
        provide: {
          [key as symbol]: mockedValues,
        },
      },
      slots: {
        default: label,
      },
    }),
    mockedValues,
  ] as const;
};

describe('FusionAuthLogoutButton', () => {
  it('renders with label', () => {
    const [Button] = setup();
    expect(Button.text()).toBe(label);
  });

  it('can be clicked to run logout()', () => {
    const [Button, { logout }] = setup();
    Button.trigger('click');
    expect(logout).toHaveBeenCalledOnce();
  });
});
