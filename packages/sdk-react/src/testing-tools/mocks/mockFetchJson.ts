import { vi } from 'vitest';

export const mockFetchJson = (json: any) => {
  // @ts-ignore
  vi.spyOn(global, 'fetch').mockResolvedValue({
    json: vi.fn().mockResolvedValue(json),
  });
};
