<script setup lang="ts">
import type { MockUser } from '../../types/auth'

interface Props {
  user?: MockUser | null
}

defineProps<Props>()
</script>

<template>
  <div class="app-shell">
    <slot />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  width: 100%;
}
</style>
