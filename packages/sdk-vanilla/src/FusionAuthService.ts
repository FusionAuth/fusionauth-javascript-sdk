import { SDKCore, SDKConfig, UserInfo } from '@fusionauth-sdk/core';

export class FusionAuthService {
  private core: SDKCore;

  constructor(config: SDKConfig) {
    this.core = new SDKCore(config);
  }

  startLogin(state?: string): void {
    const config = FusionAuthService.getConfig();
    if (config) {
      this.core = new SDKCore(config);
      this.core.startLogin(state);
    } else {
      throw new Error('FusionAuthService is not configured.');
    }
  }

  startRegister(state?: string): void {
    const config = FusionAuthService.getConfig();
    if (config) {
      this.core = new SDKCore(config);
      this.core.startRegister(state);
    } else {
      throw new Error('FusionAuthService is not configured.');
    }
  }

  startLogout(): void {
    const config = FusionAuthService.getConfig();
    if (config) {
      this.core = new SDKCore(config);
      this.core.startLogout();
    } else {
      throw new Error('FusionAuthService is not configured.');
    }
  }

  manageAccount(): void {
    const config = FusionAuthService.getConfig();
    if (config) {
      this.core = new SDKCore(config);
      this.core.manageAccount();
    } else {
      throw new Error('FusionAuthService is not configured.');
    }
  }

  async fetchUserInfo<T = UserInfo>(): Promise<T> {
    const config = FusionAuthService.getConfig();
    if (config) {
      this.core = new SDKCore(config);
      return await this.core.fetchUserInfo<T>();
    } else {
      throw new Error('FusionAuthService is not configured.');
    }
  }

  async refreshToken(): Promise<Response> {
    const config = FusionAuthService.getConfig();
    if (config) {
      this.core = new SDKCore(config);
      return await this.core.refreshToken();
    } else {
      throw new Error('FusionAuthService is not configured.');
    }
  }

  initAutoRefresh(): NodeJS.Timeout | undefined {
    const config = FusionAuthService.getConfig();
    if (config) {
      this.core = new SDKCore(config);
      return this.core.initAutoRefresh();
    } else {
      throw new Error('FusionAuthService is not configured.');
    }
  }

  handlePostRedirect(callback?: (state?: string) => void): void {
    const config = FusionAuthService.getConfig();
    if (config) {
      this.core = new SDKCore(config);
      this.core.handlePostRedirect(callback);
    } else {
      throw new Error('FusionAuthService is not configured.');
    }
  }

  get isLoggedIn(): boolean {
    const config = FusionAuthService.getConfig();
    if (config) {
      this.core = new SDKCore(config);
      return this.core.isLoggedIn;
    } else {
      throw new Error('FusionAuthService is not configured.');
    }
  }

  static configure(config: SDKConfig): FusionAuthService {
    localStorage.setItem('fusionauth-config', JSON.stringify(config));
    return new FusionAuthService(config);
  }

  static getConfig(): SDKConfig | null {
    const config = localStorage.getItem('fusionauth-config');
    return config ? JSON.parse(config) : null;
  }
}
