import { App } from 'vue';
import { FusionAuth, FusionAuthConfig } from './types.ts';
import * as components from './components/index.ts';
import { fusionAuthKey } from './injectionSymbols.ts';
import { createFusionAuth } from './createFusionAuth/index.ts';

type FusionAuthInstantiated = { instance: FusionAuth };

/**
 * Installation method for the FusionAuthVuePlugin.
 *
 * @category Plugin
 * @param {App} app - The Vue app instance.
 * @param {FusionAuthConfig | FusionAuthInstantiated} options - The configuration options for the plugin or an object containing a FusionAuth instance.
 * @throws {Error} Will throw an error if the required options are missing.
 */
const FusionAuthVuePlugin = {
  install(app: App, options: FusionAuthConfig | FusionAuthInstantiated) {
    const { instance } = options as FusionAuthInstantiated;

    let fusionAuth: FusionAuth;

    if (instance) {
      fusionAuth = instance;
    } else {
      const config = options as FusionAuthConfig;
      validateConfig(config);
      fusionAuth = createFusionAuth(config);
    }

    // Register the instance
    app.provide(fusionAuthKey, fusionAuth);

    // Register the components
    Object.entries(components).forEach(([key, component]) => {
      app.component(key, component);
    });
  },
};

function validateConfig(config: FusionAuthConfig) {
  if (!config.clientId) {
    throw new Error('clientId is required');
  }

  if (!config.serverUrl) {
    throw new Error('serverUrl is required');
  }

  if (!config.redirectUri) {
    throw new Error('redirectUri is required');
  }
}

export default FusionAuthVuePlugin;
