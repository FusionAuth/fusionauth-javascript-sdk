import { Component } from '@angular/core';
import { FusionAuthService } from '../../fusion-auth.service';

@Component({
  selector: 'fa-logout',
  templateUrl: './fusion-auth-logout-button.component.html',
  styleUrls: ['../fa-button.scss', './fusion-auth-logout-button.component.scss']
})
export class FusionAuthLogoutButtonComponent {
  constructor(private fusionAuth: FusionAuthService) {}

  logout() {
    this.fusionAuth.logout();
  }
}
