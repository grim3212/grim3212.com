<script setup lang="ts">
// Text from the Grim Pack export (cleaned up at build time in server/utils/grimpack.ts).
// Links to other pages on this site navigate without a full reload.
defineProps<{ html: string }>()

function onClick(e: MouseEvent) {
  const a = (e.target as HTMLElement).closest('a')
  const href = a?.getAttribute('href')
  if (!href?.startsWith('/') || a?.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
  e.preventDefault()
  navigateTo(href)
}
</script>

<template>
  <!-- eslint-disable vue/no-v-html -- our own content, from the mod's export -->
  <div
    class="gp-prose"
    @click="onClick"
    v-html="html"
  />
</template>
