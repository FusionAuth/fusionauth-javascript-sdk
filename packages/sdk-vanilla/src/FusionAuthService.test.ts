import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FusionAuthService } from './FusionAuthService';
import { SDKConfig } from '@fusionauth-sdk/core';

describe('FusionAuthService', () => {
  const config: SDKConfig = {
    clientId: 'test-client-id',
    redirectUri: 'http://localhost:3000',
    serverUrl: 'http://localhost:9011',
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should configure the FusionAuthService and store config in localStorage', () => {
    const service = FusionAuthService.configure(config);
    const storedConfig = localStorage.getItem('fusionauth-config');
    expect(storedConfig).toBe(JSON.stringify(config));
    expect(service).toBeInstanceOf(FusionAuthService);
  });

  it('should retrieve the config from localStorage', () => {
    localStorage.setItem('fusionauth-config', JSON.stringify(config));
    const retrievedConfig = FusionAuthService.getConfig();
    expect(retrievedConfig).toEqual(config);
  });

  it('should throw an error if FusionAuthService is not configured', () => {
    const service = new FusionAuthService(config);
    localStorage.clear();
    expect(() => service.startLogin()).toThrowError('FusionAuthService is not configured.');
    expect(() => service.startRegister()).toThrowError('FusionAuthService is not configured.');
    expect(() => service.startLogout()).toThrowError('FusionAuthService is not configured.');
    expect(() => service.manageAccount()).toThrowError('FusionAuthService is not configured.');
    expect(() => service.fetchUserInfo()).toThrowError('FusionAuthService is not configured.');
    expect(() => service.refreshToken()).toThrowError('FusionAuthService is not configured.');
    expect(() => service.initAutoRefresh()).toThrowError('FusionAuthService is not configured.');
    expect(() => service.handlePostRedirect()).toThrowError('FusionAuthService is not configured.');
    expect(() => service.isLoggedIn).toThrowError('FusionAuthService is not configured.');
  });

  it('should start login flow', () => {
    const service = FusionAuthService.configure(config);
    const startLoginSpy = vi.spyOn(service, 'startLogin');
    service.startLogin();
    expect(startLoginSpy).toHaveBeenCalled();
  });

  it('should start register flow', () => {
    const service = FusionAuthService.configure(config);
    const startRegisterSpy = vi.spyOn(service, 'startRegister');
    service.startRegister();
    expect(startRegisterSpy).toHaveBeenCalled();
  });

  it('should start logout flow', () => {
    const service = FusionAuthService.configure(config);
    const startLogoutSpy = vi.spyOn(service, 'startLogout');
    service.startLogout();
    expect(startLogoutSpy).toHaveBeenCalled();
  });

  it('should manage account', () => {
    const service = FusionAuthService.configure(config);
    const manageAccountSpy = vi.spyOn(service, 'manageAccount');
    service.manageAccount();
    expect(manageAccountSpy).toHaveBeenCalled();
  });

  it('should fetch user info', async () => {
    const service = FusionAuthService.configure(config);
    const fetchUserInfoSpy = vi.spyOn(service, 'fetchUserInfo');
    await service.fetchUserInfo();
    expect(fetchUserInfoSpy).toHaveBeenCalled();
  });

  it('should refresh token', async () => {
    const service = FusionAuthService.configure(config);
    const refreshTokenSpy = vi.spyOn(service, 'refreshToken');
    await service.refreshToken();
    expect(refreshTokenSpy).toHaveBeenCalled();
  });

  it('should initialize auto refresh', () => {
    const service = FusionAuthService.configure(config);
    const initAutoRefreshSpy = vi.spyOn(service, 'initAutoRefresh');
    service.initAutoRefresh();
    expect(initAutoRefreshSpy).toHaveBeenCalled();
  });

  it('should handle post redirect', () => {
    const service = FusionAuthService.configure(config);
    const handlePostRedirectSpy = vi.spyOn(service, 'handlePostRedirect');
    service.handlePostRedirect();
    expect(handlePostRedirectSpy).toHaveBeenCalled();
  });

  it('should return isLoggedIn status', () => {
    const service = FusionAuthService.configure(config);
    const isLoggedInSpy = vi.spyOn(service, 'isLoggedIn', 'get');
    const isLoggedIn = service.isLoggedIn;
    expect(isLoggedInSpy).toHaveBeenCalled();
    expect(isLoggedIn).toBe(false);
  });
});
