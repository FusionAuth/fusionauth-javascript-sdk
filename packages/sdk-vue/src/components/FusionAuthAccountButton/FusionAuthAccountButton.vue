<script setup lang="ts">
import { useFusionAuth } from '#/composables/useFusionAuth.ts';
const { manageAccount } = useFusionAuth();
</script>

<template>
  <button class="fusionauth-button" @click="manageAccount()">
    <slot>Manage Account</slot>
  </button>
</template>

<style lang="scss" scoped>
@import '#/styles/button.scss';
</style>
