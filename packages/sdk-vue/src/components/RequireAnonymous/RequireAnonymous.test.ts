import { ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import RequireAnonymous from './RequireAnonymous.vue';
import { getMockFusionAuth } from '../../utilsForTests';
import { FusionAuth } from '../../types';

function setup(params: {
  fusionAuthMock: Partial<FusionAuth>;
  content: string;
}) {
  const { key, mockedValues } = getMockFusionAuth(params.fusionAuthMock);
  return mount(RequireAnonymous, {
    global: { provide: { [key as symbol]: mockedValues } },
    slots: { default: params.content },
  });
}

describe('RequireAnonymous', () => {
  it('Renders the slot if not logged in', () => {
    const content = 'There is content here';
    const wrapper = setup({
      fusionAuthMock: { isLoggedIn: ref(false) },
      content,
    });

    expect(wrapper.text()).toBe(content);
  });

  it('Does not render the slot if logged in', () => {
    const wrapper = setup({
      fusionAuthMock: { isLoggedIn: ref(true) },
      content: 'For admins only',
    });

    expect(wrapper.text()).toBe('');
  });
});
