import { FusionAuthService } from '../FusionAuthService';

export class FaAccount extends HTMLElement {
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
    this.innerHTML = `<button id="fa-account-button">Manage Account</button>`;
    this.querySelector('#fa-account-button')?.addEventListener('click', () => {
      this.fusionAuthService.manageAccount();
    });
  }
}

customElements.define('fa-account', FaAccount);
