<script setup lang="ts">
import { ref } from 'vue';
import { useFusionAuth } from '@fusionauth/vue-sdk';

const apiUrl = 'https://api.fusionauth-dpop.orb.local/resource';
const { dpopFetch, isLoggedIn, login, logout } = useFusionAuth();
const result = ref('');

async function callResource() {
  try {
    const response = await dpopFetch!(apiUrl);
    const body = await response.text();
    result.value = response.ok ? body : `HTTP ${response.status}: ${body}`;
  } catch (error) {
    result.value = error instanceof Error ? error.message : 'Request failed';
  }
}
</script>

<template>
  <main>
    <h1>Vue DPoP demo</h1>
    <template v-if="isLoggedIn">
      <button @click="logout">Logout</button>
      <button @click="callResource">Call resource server</button>
    </template>
    <button v-else @click="login()">Login</button>
    <pre>{{ result }}</pre>
  </main>
</template>
