interface Validator {
  isValid: () => boolean;
}

class GUIDInvalid implements Validator {
  readonly invalidValue: string;

  constructor(value: string) {
    this.invalidValue = value;
  }

  isValid(): this is GUID {
    return false;
  }
}

export class GUID implements Validator {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  isValid(): this is GUID {
    return GUID.isValid(this.value);
  }

  static isValid(valueToTest: string): boolean {
    const pattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return pattern.test(valueToTest);
  }

  static from<T = GUID | GUIDInvalid>(value: string): T {
    if (GUID.isValid(value)) {
      return new GUID(value) as T;
    } else {
      return new GUIDInvalid(value) as T;
    }
  }
}

const bar = GUID.from('invalid GUID');

if (bar.isValid()) {
  bar.value; // GUID.string
} else {
  bar; //
}
