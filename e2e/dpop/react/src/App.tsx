import { useState } from 'react';
import { useFusionAuth } from '@fusionauth/react-sdk';

const apiUrl = 'https://api.fusionauth-dpop.orb.local/resource';

export function App() {
  const { dpopFetch, isLoggedIn, startLogin, startLogout } = useFusionAuth();
  const [result, setResult] = useState('');

  async function callResource() {
    try {
      const response = await dpopFetch!(apiUrl);
      const body = await response.text();
      setResult(response.ok ? body : `HTTP ${response.status}: ${body}`);
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'Request failed');
    }
  }

  return (
    <main>
      <h1>React DPoP demo</h1>
      {isLoggedIn ? (
        <>
          <button onClick={startLogout}>Logout</button>{' '}
          <button onClick={callResource}>Call resource server</button>
        </>
      ) : (
        <button onClick={() => startLogin()}>Login</button>
      )}
      <pre>{result}</pre>
    </main>
  );
}
