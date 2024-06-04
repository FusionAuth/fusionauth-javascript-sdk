import { InjectionToken } from '@angular/core';
import { FusionAuthConfig } from './types';

export const FUSIONAUTH_SERVICE_CONFIG = new InjectionToken<FusionAuthConfig>(
  'FUSIONAUTH_SERVICE_CONFIG',
);
