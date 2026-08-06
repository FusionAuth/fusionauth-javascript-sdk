import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { FusionAuthProvider } from '@fusionauth/react-sdk';
import { App } from './App';

const appUrl = 'https://react.fusionauth-dpop.orb.local';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FusionAuthProvider
      clientId={import.meta.env.VITE_CLIENT_ID}
      dpopTokenStorage="localStorage"
      postLogoutRedirectUri={appUrl}
      redirectUri={appUrl}
      serverUrl="https://local.fusionauth.io"
      useDpop={true}
    >
      <App />
    </FusionAuthProvider>
  </StrictMode>,
);
