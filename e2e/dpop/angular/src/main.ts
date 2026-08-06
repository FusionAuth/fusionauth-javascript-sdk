import { Component, inject } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FusionAuthModule, FusionAuthService } from '@fusionauth/angular-sdk';

const apiUrl = 'https://api.fusionauth-dpop.orb.local/resource';
const appUrl = 'https://angular.fusionauth-dpop.orb.local';

@Component({
  imports: [FusionAuthModule],
  selector: 'app-root',
  standalone: true,
  template: `
    <main>
      <h1>Angular DPoP demo</h1>
      @if (fusionAuth.isLoggedInSignal()) {
        <button (click)="fusionAuth.logout()">Logout</button>
        <button (click)="callResource()">Call resource server</button>
      } @else {
        <button (click)="fusionAuth.startLogin()">Login</button>
      }
      <pre>{{ result }}</pre>
    </main>
  `,
})
class AppComponent {
  readonly fusionAuth = inject(FusionAuthService);
  result = '';

  async callResource() {
    try {
      const response = await this.fusionAuth.dpopFetch(apiUrl);
      const body = await response.text();
      this.result = response.ok ? body : `HTTP ${response.status}: ${body}`;
    } catch (error) {
      this.result = error instanceof Error ? error.message : 'Request failed';
    }
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    ...FusionAuthModule.forRoot({
      clientId: '__CLIENT_ID__',
      dpopTokenStorage: 'localStorage',
      postLogoutRedirectUri: appUrl,
      redirectUri: appUrl,
      serverUrl: 'https://local.fusionauth.io',
      useDpop: true,
    }).providers!,
  ],
}).catch(() => {
  document.body.textContent = 'Application failed to start';
});
