import { ModuleWithProviders, NgModule } from '@angular/core';
import { FusionAuthConfig } from './types';
import { FusionAuthService } from './fusion-auth.service';
import { FusionAuthLoginButtonComponent } from './components/fusionauth-login.button/fusion-auth-login-button.component';
import { FusionAuthLogoutButtonComponent } from './components/fusionauth-logout.button/fusion-auth-logout-button.component';
import { FusionAuthRegisterButtonComponent } from './components/fusionauth-register.button/fusion-auth-register-button.component';

@NgModule({
  declarations: [
    FusionAuthLoginButtonComponent,
    FusionAuthLogoutButtonComponent,
    FusionAuthRegisterButtonComponent,
  ],
  imports: [],
  exports: [
    FusionAuthLoginButtonComponent,
    FusionAuthLogoutButtonComponent,
    FusionAuthRegisterButtonComponent,
  ],
})
export class FusionAuthModule {
  static forRoot(
    fusionAuthConfig: FusionAuthConfig,
  ): ModuleWithProviders<FusionAuthModule> {
    return {
      ngModule: FusionAuthModule,
      providers: [
        {
          provide: FusionAuthService,
          useValue: new FusionAuthService(fusionAuthConfig),
        },
      ],
    };
  }
}
