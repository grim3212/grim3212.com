<script setup lang="ts">
import { projects } from '~/data/projects'

useSeoMeta({
  title: 'Grim3212',
  description: 'Projects by Grim3212, including the Grim Pack Minecraft mod and its documentation.',
})
</script>

<template>
  <div>
    <section class="border-b border-line">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <p class="font-pixel text-accent">
          Hi, I'm
        </p>
        <h1 class="mt-2 font-pixel text-5xl font-semibold sm:text-7xl">
          Grim3212
        </h1>
        <p class="mt-4 max-w-xl text-lg text-muted">
          I make Minecraft mods and the odd web project. Here's what's live right now.
        </p>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-12">
      <h2 class="font-pixel text-2xl font-semibold">
        Projects
      </h2>
      <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="p in projects"
          :key="p.name"
          :to="p.to ?? p.href"
          class="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition hover:-translate-y-0.5 hover:border-accent focus-visible:border-accent"
        >
          <div
            v-if="p.image"
            class="h-40 overflow-hidden bg-surface-2"
          >
            <img
              :src="p.image"
              alt=""
              class="size-full"
              :class="p.imageFit === 'contain' ? 'object-contain p-6' : 'object-cover'"
            >
          </div>
          <div class="flex flex-1 flex-col p-5">
            <h3 class="font-pixel text-xl font-semibold group-hover:text-accent">
              {{ p.name }}
            </h3>
            <p class="mt-2 flex-1 text-sm text-muted">
              {{ p.blurb }}
            </p>
            <div
              v-if="p.tags"
              class="mt-4 flex flex-wrap gap-2"
            >
              <span
                v-for="t in p.tags"
                :key="t"
                class="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs text-accent"
              >{{ t }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
