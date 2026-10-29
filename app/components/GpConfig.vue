<script setup lang="ts">
import type { ConfigEntry } from '~~/server/utils/grimpack'

// One option from the mod's config file, or a category of them (shown nested).
defineProps<{ entry: ConfigEntry }>()
</script>

<template>
  <div
    v-if="entry.children"
    class="rounded-xl border border-line bg-surface p-5"
  >
    <h2 class="font-pixel text-xl font-semibold text-accent">
      {{ entry.name }}
    </h2>
    <p
      v-if="entry.comment"
      class="mt-1 text-sm text-muted"
    >
      {{ entry.comment }}
    </p>
    <div class="mt-4 space-y-3">
      <GpConfig
        v-for="child in entry.children"
        :key="child.name"
        :entry="child"
      />
    </div>
  </div>

  <div
    v-else
    class="rounded-lg border border-line bg-surface-2 px-4 py-3"
  >
    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h3 class="font-semibold">
        {{ entry.name }}
      </h3>
      <span class="font-mono text-xs text-muted">{{ entry.type }}<template v-if="entry.min !== undefined">, {{ entry.min }} to {{ entry.max }}</template></span>
    </div>
    <p
      v-if="entry.comment"
      class="mt-1 text-sm text-muted"
    >
      {{ entry.comment }}
    </p>
    <div class="mt-2 flex flex-wrap items-center gap-2 text-xs">
      <span class="text-muted">Default</span>
      <code
        v-for="(d, n) in entry.defaults"
        :key="n"
        class="rounded bg-surface px-1.5 py-0.5 font-mono"
      >{{ d === '' ? '(empty)' : d }}</code>
      <span
        v-if="entry.mcRestart"
        class="rounded-full bg-accent-soft px-2 py-0.5 text-accent"
      >Needs a game restart</span>
      <span
        v-else-if="entry.worldRestart"
        class="rounded-full bg-accent-soft px-2 py-0.5 text-accent"
      >Needs a world reload</span>
    </div>
  </div>
</template>
