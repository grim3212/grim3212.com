<script setup lang="ts">
import type { Stack } from '~~/server/utils/grimpack'

// One item: its icon, the stack size and a Minecraft-style tooltip on hover or focus.
// It links to the item's own page in the docs when it has one.
const props = withDefaults(defineProps<{ stack: Stack, size?: 'slot' | 'showcase' }>(), { size: 'slot' })
const NuxtLink = resolveComponent('NuxtLink')
const items = inject(ITEMS)!
const item = computed(() => items.value[props.stack.item])

const src = computed(() => {
  const i = item.value
  if (!i) return undefined
  if (props.size === 'showcase' && i.large) return { src: `${i.icon}/160.png` }
  return { src: `${i.icon}/32.png`, ...(i.large ? { srcset: `${i.icon}/64.png 2x` } : {}) }
})
</script>

<template>
  <!-- eslint-disable vue/no-v-html -- the mod's own tooltip lines -->
  <component
    :is="item?.href ? NuxtLink : 'span'"
    v-if="item"
    v-bind="item.href ? { to: item.href } : { tabindex: 0, class: 'cursor-help' }"
    class="group relative inline-grid place-items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    :class="size === 'showcase' ? 'w-40 gap-2 rounded-xl border border-line bg-surface-2 p-3 text-center hover:border-accent focus-visible:border-accent' : ''"
    :aria-label="item.name"
  >
    <img
      v-bind="src"
      :alt="item.name"
      class="pixelated"
      :class="[size === 'showcase' ? 'size-32' : 'size-8', item.oreName ? 'drop-shadow-[0_0_4px_#f5c542]' : '']"
      loading="lazy"
    >
    <span
      v-if="size === 'showcase'"
      class="text-sm font-medium"
    >{{ item.name }}</span>
    <span
      v-if="stack.amount"
      class="pointer-events-none absolute font-pixel text-sm text-white [text-shadow:2px_2px_0_#3f3f3f]"
      :class="size === 'showcase' ? 'top-2 right-3' : '-right-1 -bottom-1'"
    >{{ stack.amount }}</span>

    <span
      role="tooltip"
      class="mc-tooltip pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden w-max max-w-64 -translate-x-1/2 px-2 py-1.5 text-left group-hover:block group-focus-visible:block"
    >
      <span class="block font-semibold">{{ item.name }}</span>
      <span
        v-for="(line, n) in item.tooltip"
        :key="n"
        class="block text-[#aaa]"
        v-html="line"
      />
      <span
        v-if="item.oreName"
        class="block text-[#ffaa00]"
      >Accepts any {{ item.oreName }}</span>
    </span>
  </component>
</template>
