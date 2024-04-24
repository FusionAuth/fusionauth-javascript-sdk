<template>
  <template v-if="!isLoggedIn">
    <slot></slot>
  </template>
</template>

<script setup lang="ts">
import { useFusionAuth } from '#/composables/useFusionAuth.ts';

const { isLoggedIn } = useFusionAuth();
</script>
