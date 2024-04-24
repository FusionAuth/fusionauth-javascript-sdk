import FusionAuthLoginButton from './FusionAuthLoginButton.vue';
import { describe, expect, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { getMockFusionAuth } from '../../utilsForTests';

const stateValue = 'login-state-value';
const setup = () => {
  const { key, mockedValues } = getMockFusionAuth({});
  return [
    shallowMount(FusionAuthLoginButton, {
      props: { state: stateValue },
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
  it('renders with label', () => {
    // Test
    const [Button] = setup();

    // Assert
    expect(Button.text()).toBe('Label');
  });

  it('can be clicked to run login()', () => {
    // Setup
    const [Button, { login }] = setup();

    // Test
    Button.trigger('click');

    // Assert
    expect(login).toHaveBeenCalledOnce();
    expect(login).toHaveBeenCalledWith(stateValue);
  });
});
