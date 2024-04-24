import { ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import RequireAuth from './RequireAuth.vue';
import { getMockFusionAuth } from '../../utilsForTests';
import { FusionAuth } from '../../types';

function setup(params: {
  fusionAuthMock: Partial<FusionAuth>;
  content: string;
  withRole: string[];
}) {
  const { key, mockedValues } = getMockFusionAuth(params.fusionAuthMock);

  return mount(RequireAuth, {
    global: { provide: { [key]: mockedValues } },
    slots: { default: params.content },
    props: {
      withRole: params.withRole,
    },
  });
}

describe('RequireAuth', () => {
  it('Renders the slot if the user is logged in with the specified role', () => {
    const content = 'Protected Content';
    const wrapper = setup({
      fusionAuthMock: {
        isLoggedIn: ref(true),
        userInfo: ref({ roles: ['ADMIN'] }),
      },
      content,
      withRole: ['USER', 'ADMIN'],
    });

    expect(wrapper.text()).toBe(content);
  });

  it('Does not render the slot if the user is not authorized', () => {
    const wrapper = setup({
      fusionAuthMock: {
        isLoggedIn: ref(true),
        userInfo: ref({ roles: ['USER'] }),
      },
      content: 'For admins only',
      withRole: ['ADMIN', 'SUPER-ADMIN'],
    });

    expect(wrapper.text()).toBe('');
  });
});
