import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FaLogout } from './fa-logout';
import { FusionAuthService } from '../FusionAuthService';

describe('FaLogout', () => {
  let element: FaLogout;
  let startLogoutSpy: jest.SpyInstance;

  beforeEach(() => {
    element = new FaLogout();
    document.body.appendChild(element);
    startLogoutSpy = jest.spyOn(FusionAuthService.prototype, 'startLogout');
  });

  afterEach(() => {
    document.body.removeChild(element);
    startLogoutSpy.mockRestore();
  });

  it('should render the button', () => {
    const button = element.querySelector('#fa-logout-button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toBe('Logout');
  });

  it('should call startLogout on button click', () => {
    const button = element.querySelector('#fa-logout-button');
    button?.dispatchEvent(new Event('click'));
    expect(startLogoutSpy).toHaveBeenCalled();
  });
});
