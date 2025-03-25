import { Component, Input } from '@angular/core';
import { FusionAuthService } from '../../fusion-auth.service';

@Component({
  selector: 'fa-login',
  templateUrl: './fusion-auth-login-button.component.html',
  styleUrls: ['../fa-button.scss', './fusion-auth-login-button.component.scss'],
})
export class FusionAuthLoginButtonComponent {
  @Input() state: string | undefined;

  constructor(private fusionAuth: FusionAuthService) {}

  login() {
    this.fusionAuth.startLogin(this.state);
  }
}
