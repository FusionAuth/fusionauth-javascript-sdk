import { createApp } from 'vue';
import FusionAuthVuePlugin from '@fusionauth/vue-sdk';
import App from './App.vue';

const appUrl = 'https://vue.fusionauth-dpop.orb.local';

createApp(App)
  .use(FusionAuthVuePlugin, {
    clientId: import.meta.env.VITE_CLIENT_ID,
    dpopTokenStorage: 'localStorage',
    postLogoutRedirectUri: appUrl,
    redirectUri: appUrl,
    serverUrl: 'https://local.fusionauth.io',
    useDpop: true,
  })
  .mount('#app');
