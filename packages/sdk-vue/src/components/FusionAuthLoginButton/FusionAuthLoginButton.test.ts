import FusionAuthLoginButton from './FusionAuthLoginButton.vue';
import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { getMockFusionAuth } from '../../utilsForTests';

const setup = () => {
  const { key, mockedValues } = getMockFusionAuth({});
  return [
    shallowMount(FusionAuthLoginButton, {
      global: {
        provide: {
          [key]: mockedValues,
        },
      },
      slots: {
        default: 'Label',
      },
    }),
    mockedValues,
  ] as const;
};

describe('FusionAuthLoginButton', () => {
  it('renders with label', async () => {
    // Test
    const [Button] = setup();

    // Assert
    expect(Button.text()).toBe('Label');
  });

  it('can be clicked to run login()', async () => {
    // Setup
    const [Button, { login }] = setup();

    // Test
    Button.trigger('click');

    // Assert
    expect(login).toHaveBeenCalledOnce();
  });
});
