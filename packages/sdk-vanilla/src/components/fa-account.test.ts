import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FaAccount } from './fa-account';
import { FusionAuthService } from '../FusionAuthService';

describe('FaAccount', () => {
  let element: FaAccount;
  let manageAccountSpy: jest.SpyInstance;

  beforeEach(() => {
    element = new FaAccount();
    document.body.appendChild(element);
    manageAccountSpy = jest.spyOn(FusionAuthService.prototype, 'manageAccount');
  });

  afterEach(() => {
    document.body.removeChild(element);
    manageAccountSpy.mockRestore();
  });

  it('should render the button', () => {
    const button = element.querySelector('#fa-account-button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toBe('Manage Account');
  });

  it('should call manageAccount on button click', () => {
    const button = element.querySelector('#fa-account-button');
    button?.dispatchEvent(new Event('click'));
    expect(manageAccountSpy).toHaveBeenCalled();
  });
});
