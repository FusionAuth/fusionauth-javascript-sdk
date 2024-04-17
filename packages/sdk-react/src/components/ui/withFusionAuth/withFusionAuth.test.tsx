import { Component } from 'react';
import { describe, expect, test, vi } from 'vitest';
import {
  withFusionAuth,
  WithFusionAuthProps,
} from '#components/ui/withFusionAuth';
import { render } from '@testing-library/react';
import { FusionAuthContext } from '#components/providers/Context';
import { FusionAuthProviderContext } from '#/components/providers/FusionAuthProviderContext';

import { createContextMock } from '#testing-tools/mocks/createContextMock';

describe('withFusionAuth', () => {
  test('component wrapped in HOC receives context values', () => {
    const startLogout = vi.fn();
    renderWrappedComponent({ startLogout });

    expect(startLogout).toHaveBeenCalled();
  });
});

class WithoutFusionAuth extends Component<WithFusionAuthProps> {
  render() {
    return <div>Test Component</div>;
  }

  componentDidMount() {
    this.props.fusionAuth.startLogout();
  }
}

const WithFusionAuth = withFusionAuth(WithoutFusionAuth);

const renderWrappedComponent = (
  context: Partial<FusionAuthProviderContext>,
) => {
  const contextMock = createContextMock(context);
  render(
    <FusionAuthContext.Provider value={contextMock}>
      <WithFusionAuth />
    </FusionAuthContext.Provider>,
  );
};
