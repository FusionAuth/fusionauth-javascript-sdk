<template>
  <template v-if="isAuthorized">
    <slot></slot>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFusionAuth } from '#/composables/useFusionAuth';

const props = defineProps<{
  withRole?: string | string[];
}>();

const { isLoggedIn, userInfo } = useFusionAuth();

const isAuthorized = computed(() => {
  if (!isLoggedIn.value === true || userInfo.value === null) {
    return false;
  }

  if (!props.withRole) {
    return true;
  }

  const roles = Array.isArray(props.withRole)
    ? props.withRole
    : [props.withRole];
  const userRoles = userInfo.value?.roles ?? [];

  const isAuthenticated = isLoggedIn.value === true;
  const isAuthorized = userRoles.some(role => roles.includes(role));

  return isAuthenticated && isAuthorized;
});
</script>
