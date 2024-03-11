<template>
  <button class="logout-button" @click="doLogout()">
    <slot>Logout</slot>
  </button>
</template>

<script setup lang="ts">
import { useFusionAuth } from '../composables/useFusionAuth.ts';

const fusionAuth = useFusionAuth();

function doLogout() {
  fusionAuth.logout();
}
</script>

<style lang="scss" scoped>
@import '../styles/button.scss';

.logout-button {
  @extend .fusionauth-button;
}
</style>
