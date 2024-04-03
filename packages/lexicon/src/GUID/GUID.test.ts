import { describe, expect, it } from 'vitest';

import { GUID } from '.';

const validRawGUID = 'e9fdb985-9173-4e01-9d73-ac2d60d1dc8e';
const invalidRawGUID = 'Invalid GUID';

describe('GUID', () => {
  it('should determine if GUID is valid', () => {
    expect(GUID.isValid(validRawGUID)).toBe(true);
  });

  it('should determine if GUID is invalid', () => {
    expect(GUID.isValid(invalidRawGUID)).toBe(false);
  });

  it('should create a GUID from a string representing avalid GUID', () => {
    const testGUID = GUID.from(validRawGUID);
    expect(testGUID.isValid()).toBe(true);
  });

  it('should create a GUIDInvalid from a string representing an invalid GUID', () => {
    const testGUID = GUID.from(invalidRawGUID);
    expect(testGUID.isValid()).toBe(false);
  });

  it('should provide access to value when value is valid', () => {
    const testGUID = GUID.from(validRawGUID);
    if (testGUID.isValid()) {
      expect(testGUID.value).toBe(validRawGUID);
    }
  });

  it('should provide access to invalidValue when value is invalid', () => {
    const testGUID = GUID.from(invalidRawGUID);
    if (testGUID.isValid()) {
      //
    } else {
      expect(testGUID.invalidValue).toBe(invalidRawGUID);
    }
  });
});
