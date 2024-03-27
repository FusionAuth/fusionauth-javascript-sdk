import { describe, expect, it } from 'vitest';

import {
  defaultPathValues,
  makePaths,
  LoginPath,
  LogoutPath,
  MePath,
  RegisterPath,
  TokenRefreshPath,
} from '.';

const customPathValues = {
  loginPath: '/loginPath',
  logoutPath: '/logoutPath',
  mePath: '/mePath',
  registerPath: '/registerPath',
  tokenRefreshPath: '/tokenRefreshPath',
};

const pathsWithDefaultValues = makePaths();
const pathsWithCustomValues = makePaths(customPathValues);

describe('Paths', () => {
  it('should create LoginPath', () => {
    const { loginPath } = pathsWithDefaultValues;
    expect(loginPath).toBeInstanceOf(LoginPath);
  });

  it('should create LogoutPath', () => {
    const { logoutPath } = pathsWithDefaultValues;
    expect(logoutPath).toBeInstanceOf(LogoutPath);
  });

  it('should create MePath', () => {
    const { mePath } = pathsWithDefaultValues;
    expect(mePath).toBeInstanceOf(MePath);
  });

  it('should create RegisterPath', () => {
    const { registerPath } = pathsWithDefaultValues;
    expect(registerPath).toBeInstanceOf(RegisterPath);
  });

  it('should create TokenRefreshPath', () => {
    const { tokenRefreshPath } = pathsWithDefaultValues;
    expect(tokenRefreshPath).toBeInstanceOf(TokenRefreshPath);
  });
});

describe('default Paths', () => {
  it('should create LoginPath with default value', () => {
    const { loginPath } = pathsWithDefaultValues;
    expect(loginPath.getValue()).toBe(defaultPathValues.login);
  });

  it('should create LogoutPath with default value', () => {
    const { logoutPath } = pathsWithDefaultValues;
    expect(logoutPath.getValue()).toBe(defaultPathValues.logout);
  });

  it('should create MePath with default value', () => {
    const { mePath } = pathsWithDefaultValues;
    expect(mePath.getValue()).toBe(defaultPathValues.me);
  });

  it('should create RegisterPath with default value', () => {
    const { registerPath } = pathsWithDefaultValues;
    expect(registerPath.getValue()).toBe(defaultPathValues.register);
  });

  it('should create TokenRefreshPath with default value', () => {
    const { tokenRefreshPath } = pathsWithDefaultValues;
    expect(tokenRefreshPath.getValue()).toBe(defaultPathValues.tokenRefresh);
  });
});

describe('custom Paths', () => {
  it('should create LoginPath with default value', () => {
    const { loginPath } = pathsWithCustomValues;
    expect(loginPath.getValue()).toBe(customPathValues.loginPath);
  });

  it('should create LogoutPath with default value', () => {
    const { logoutPath } = pathsWithCustomValues;
    expect(logoutPath.getValue()).toBe(customPathValues.logoutPath);
  });

  it('should create MePath with default value', () => {
    const { mePath } = pathsWithCustomValues;
    expect(mePath.getValue()).toBe(customPathValues.mePath);
  });

  it('should create RegisterPath with default value', () => {
    const { registerPath } = pathsWithCustomValues;
    expect(registerPath.getValue()).toBe(customPathValues.registerPath);
  });

  it('should create TokenRefreshPath with default value', () => {
    const { tokenRefreshPath } = pathsWithCustomValues;
    expect(tokenRefreshPath.getValue()).toBe(customPathValues.tokenRefreshPath);
  });
});
