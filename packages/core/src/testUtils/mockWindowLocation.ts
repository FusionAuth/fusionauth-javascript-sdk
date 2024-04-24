import { VitestUtils } from 'vitest';

function mockWindowLocation(vi: VitestUtils) {
  const mockedLocation = {
    ...window.location,
    assign: vi.fn(),
  };
  vi.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);
  return mockedLocation;
}

export { mockWindowLocation };
