<script setup lang="ts">
defineProps<{ images: string[] }>()
</script>

<template>
  <div class="flex flex-wrap items-start justify-center gap-4">
    <a
      v-for="(src, n) in images"
      :key="src"
      :href="src"
      :aria-label="`Open picture ${n + 1} full size`"
      class="block overflow-hidden rounded-lg border border-line bg-surface-2"
    >
      <img
        :src="src"
        alt=""
        loading="lazy"
        class="max-h-96 w-auto max-w-full"
      >
    </a>
  </div>
</template>
