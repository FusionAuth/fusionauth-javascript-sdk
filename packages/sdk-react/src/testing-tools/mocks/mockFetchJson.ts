import { vi } from "vitest";

export const mockFetchJson = (json: any) => {
    // @ts-ignore
    jest.spyOn(global, 'fetch').mockResolvedValue({
        json: vi.fn().mockResolvedValue(json),
    });
};
