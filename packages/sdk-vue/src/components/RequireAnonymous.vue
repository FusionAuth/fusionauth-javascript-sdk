<template>
  <template v-if="isAnonymous">
    <slot></slot>
  </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useFusionAuth } from '../composables/useFusionAuth.ts';

const fusionAuth = useFusionAuth();
const isAnonymous = ref(false);

onMounted(async () => {
  isAnonymous.value = !fusionAuth.isLoggedIn();
});
</script>
