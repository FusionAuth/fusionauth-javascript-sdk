import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FaLogin } from './fa-login';
import { FusionAuthService } from '../FusionAuthService';

describe('FaLogin', () => {
  let element: FaLogin;
  let startLoginSpy: jest.SpyInstance;

  beforeEach(() => {
    element = new FaLogin();
    document.body.appendChild(element);
    startLoginSpy = jest.spyOn(FusionAuthService.prototype, 'startLogin');
  });

  afterEach(() => {
    document.body.removeChild(element);
    startLoginSpy.mockRestore();
  });

  it('should render the button', () => {
    const button = element.querySelector('#fa-login-button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toBe('Login');
  });

  it('should call startLogin on button click', () => {
    const button = element.querySelector('#fa-login-button');
    button?.dispatchEvent(new Event('click'));
    expect(startLoginSpy).toHaveBeenCalled();
  });
});
