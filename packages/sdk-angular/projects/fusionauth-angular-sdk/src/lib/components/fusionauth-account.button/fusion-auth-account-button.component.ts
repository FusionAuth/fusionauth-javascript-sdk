import { Component } from '@angular/core';
import { FusionAuthService } from '../../fusion-auth.service';

@Component({
  selector: 'fa-account',
  templateUrl: './fusion-auth-account-button.component.html',
  styleUrls: ['./fusion-auth-account-button.component.scss'],
})
export class FusionAuthAccountButtonComponent {
  constructor(private fusionAuth: FusionAuthService) {}

  manageAccount() {
    this.fusionAuth.manageAccount();
  }
}
