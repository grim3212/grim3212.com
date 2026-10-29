<script setup lang="ts">
import type { Project } from '~/data/projects'

defineProps<{ project: Project }>()
</script>

<template>
  <NuxtLink
    :to="project.to ?? project.href"
    class="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition hover:-translate-y-0.5 hover:border-accent focus-visible:border-accent"
  >
    <div
      v-if="project.image"
      class="h-40 overflow-hidden bg-surface-2"
    >
      <img
        :src="project.image"
        alt=""
        class="size-full"
        :class="[
          project.imageFit === 'contain' ? 'object-contain p-6' : 'object-cover',
          project.status === 'archived' ? 'opacity-70 grayscale-[60%]' : '',
        ]"
      >
    </div>
    <div class="flex flex-1 flex-col p-5">
      <h3 class="font-pixel text-xl font-semibold group-hover:text-accent">
        {{ project.name }}
      </h3>
      <p class="mt-2 flex-1 text-sm text-muted">
        {{ project.blurb }}
      </p>
      <p
        v-if="project.successor"
        class="mt-3 text-xs text-muted"
      >
        Succeeded by <span class="font-medium text-ink">{{ project.successor }}</span>.
      </p>
      <div
        v-if="project.tags"
        class="mt-4 flex flex-wrap gap-2"
      >
        <span
          v-for="t in project.tags"
          :key="t"
          class="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent"
        >{{ t }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
