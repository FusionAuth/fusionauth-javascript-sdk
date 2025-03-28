import { FusionAuthService } from '../FusionAuthService';

export class FaRegister extends HTMLElement {
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
    this.innerHTML = `<button id="fa-register-button">Register</button>`;
    this.querySelector('#fa-register-button')?.addEventListener('click', () => {
      this.fusionAuthService.startRegister();
    });
  }
}

customElements.define('fa-register', FaRegister);
