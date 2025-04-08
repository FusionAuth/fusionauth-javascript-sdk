import { FusionAuthService } from '../FusionAuthService';

export class FaLogout extends HTMLElement {
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
    this.innerHTML = `<button id="fa-logout-button">Logout</button>`;
    this.querySelector('#fa-logout-button')?.addEventListener('click', () => {
      this.fusionAuthService.startLogout();
    });
  }
}

customElements.define('fa-logout', FaLogout);
