import { FusionAuthService } from '../FusionAuthService';

export class FaLogin extends HTMLElement {
  private fusionAuthService: FusionAuthService;

  constructor() {
    super();
    this.fusionAuthService = new FusionAuthService({
      clientId: 'your-client-id',
      redirectUri: 'your-redirect-uri',
      serverUrl: 'your-server-url',
    });
  }

  connectedCallback() {
    this.innerHTML = `<button id="fa-login-button">Login</button>`;
    this.querySelector('#fa-login-button')?.addEventListener('click', () => {
      this.fusionAuthService.startLogin();
    });
  }
}

customElements.define('fa-login', FaLogin);
