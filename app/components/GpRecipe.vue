<script setup lang="ts">
import type { Recipe } from '~~/server/utils/grimpack'

// A recipe drawn like its in-game screen: the crafting grid, a furnace, or one of the pack's machines.
const props = defineProps<{ recipe: Recipe }>()
const crafting = computed(() => Boolean(props.recipe.grid))
const smelting = computed(() => ['furnace', 'MODERN_FURNACE'].includes(props.recipe.type))
</script>

<template>
  <figure class="mc-panel inline-flex flex-col gap-2 p-3">
    <figcaption class="font-pixel text-sm">
      {{ recipe.name }}
    </figcaption>
    <div class="flex items-center gap-3">
      <div
        v-if="crafting"
        class="grid grid-cols-3"
      >
        <span
          v-for="(slot, n) in recipe.grid"
          :key="n"
          class="mc-slot"
        >
          <GpItem
            v-if="slot"
            :stack="slot"
          />
        </span>
      </div>
      <div
        v-else
        class="flex flex-col items-center gap-1"
      >
        <span class="mc-slot">
          <GpItem :stack="recipe.input!" />
        </span>
        <span
          v-if="smelting"
          class="text-lg leading-none"
          aria-hidden="true"
        >🔥</span>
      </div>

      <div
        class="flex flex-col items-center"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 22 16"
          class="h-5 w-7 text-[#8b8b8b]"
          fill="currentColor"
          shape-rendering="crispEdges"
        >
          <path d="M0 6h14V2h2v2h2v2h2v2h2v0h-2v2h-2v2h-2v2h-2v-4H0z" />
        </svg>
        <span
          v-if="recipe.xp"
          class="font-pixel text-xs text-[#3c8527]"
        >{{ recipe.xp }} XP</span>
      </div>
      <span class="sr-only">makes</span>

      <span class="mc-slot mc-slot-lg">
        <GpItem :stack="recipe.output" />
      </span>
    </div>
  </figure>
</template>
