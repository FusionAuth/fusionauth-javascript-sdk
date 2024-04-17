import { vi } from 'vitest';

function mockWindowLocation() {
  const mockedLocation = {
    ...window.location,
    assign: vi.fn(),
  };
  vi.spyOn(window, 'location', 'get').mockReturnValue(mockedLocation);
  return mockedLocation;
}

export { mockWindowLocation };
