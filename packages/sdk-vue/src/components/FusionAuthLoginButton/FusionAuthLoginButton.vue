<template>
  <button class="login-button" @click="doLogin()">
    <slot>Login</slot>
  </button>
</template>

<script setup lang="ts">
import { useFusionAuth } from '../../composables/useFusionAuth';

const fusionAuth = useFusionAuth();

const props = defineProps<{
  state?: string;
}>();

function doLogin() {
  fusionAuth.login(props.state);
}
</script>

<style lang="scss" scoped>
@import '../../styles/button.scss';

.login-button {
  @extend .fusionauth-button;
}
</style>
