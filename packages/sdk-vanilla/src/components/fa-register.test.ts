import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FaRegister } from './fa-register';
import { FusionAuthService } from '../FusionAuthService';

describe('FaRegister', () => {
  let element: FaRegister;
  let startRegisterSpy: jest.SpyInstance;

  beforeEach(() => {
    element = new FaRegister();
    document.body.appendChild(element);
    startRegisterSpy = jest.spyOn(FusionAuthService.prototype, 'startRegister');
  });

  afterEach(() => {
    document.body.removeChild(element);
    startRegisterSpy.mockRestore();
  });

  it('should render the button', () => {
    const button = element.querySelector('#fa-register-button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toBe('Register');
  });

  it('should call startRegister on button click', () => {
    const button = element.querySelector('#fa-register-button');
    button?.dispatchEvent(new Event('click'));
    expect(startRegisterSpy).toHaveBeenCalled();
  });
});
