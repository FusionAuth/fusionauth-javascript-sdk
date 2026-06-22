<template>
  <button class="register-button" @click="doRegister()">
    <slot>Register</slot>
  </button>
</template>

<script setup lang="ts">
import { useFusionAuth } from '#/composables/useFusionAuth.ts';

const fusionAuth = useFusionAuth();

const props = defineProps<{
  state?: string;
}>();

function doRegister() {
  fusionAuth.register(props.state);
}
</script>

<style lang="scss" scoped>
@use '#/styles/button.scss' as *;

.register-button {
  @extend .fusionauth-button;
}
</style>
