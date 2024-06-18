import { ModuleWithProviders, NgModule } from '@angular/core';
import { FusionAuthConfig } from './types';
import { FusionAuthService } from './fusion-auth.service';
import { FUSIONAUTH_SERVICE_CONFIG } from './injectionToken';
import { FusionAuthLoginButtonComponent } from './components/fusionauth-login.button/fusion-auth-login-button.component';
import { FusionAuthLogoutButtonComponent } from './components/fusionauth-logout.button/fusion-auth-logout-button.component';
import { FusionAuthRegisterButtonComponent } from './components/fusionauth-register.button/fusion-auth-register-button.component';
import { FusionAuthAccountButtonComponent } from './components/fusionauth-account.button/fusion-auth-account-button.component';

@NgModule({
  declarations: [
    FusionAuthLoginButtonComponent,
    FusionAuthLogoutButtonComponent,
    FusionAuthRegisterButtonComponent,
    FusionAuthAccountButtonComponent,
  ],
  imports: [],
  exports: [
    FusionAuthLoginButtonComponent,
    FusionAuthLogoutButtonComponent,
    FusionAuthRegisterButtonComponent,
    FusionAuthAccountButtonComponent,
  ],
})
export class FusionAuthModule {
  static forRoot(
    fusionAuthConfig: FusionAuthConfig,
  ): ModuleWithProviders<FusionAuthModule> {
    return {
      ngModule: FusionAuthModule,
      providers: [
        { provide: FUSIONAUTH_SERVICE_CONFIG, useValue: fusionAuthConfig },
        FusionAuthService,
      ],
    };
  }
}
