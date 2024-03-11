<template>
  <template v-if="hasRole">
    <slot></slot>
  </template>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useFusionAuth } from '../composables/useFusionAuth';
import type { FusionAuth } from '../types';

const props = defineProps<{
  withRole?: string | string[];
}>();

const hasRole = ref(false);
const fusionAuth = useFusionAuth();

onMounted(async () => {
  hasRole.value = await checkRole(fusionAuth);
});

/**
 * Checks if the user has the specified role(s).
 *
 * @param {FusionAuth} fusionAuth - Instance of the FusionAuth client.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the user has the role(s).
 */
async function checkRole(fusionAuth: FusionAuth): Promise<boolean> {
  if (fusionAuth.isLoggedIn()) {
    if (props.withRole) {
      const userInfo = await fusionAuth.getUserInfo();
      const roles = Array.isArray(props.withRole)
        ? props.withRole
        : [props.withRole];
      return !!userInfo.roles?.some(role => roles.includes(role.name));
    }
    return true;
  }
  return false;
}
</script>
