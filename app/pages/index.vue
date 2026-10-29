<script setup lang="ts">
import { projects } from '~/data/projects'

const active = projects.filter(p => p.status === 'active')
const archived = projects.filter(p => p.status === 'archived')

usePageSeo({
  title: 'Grim3212 · Dakota Pierone',
  titleTemplate: null,
  description: 'Minecraft mods and web projects by Dakota Pierone (Grim3212): Assorted Mods, Anime Dub Status, '
    + 'and the documentation for the Grim Pack mod.',
  image: '/projects/assortedmods.webp',
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
          Grim<span class="text-accent">3212</span>
        </h1>
        <p class="mt-4 max-w-xl text-lg text-muted">
          I make Minecraft mods and the odd web project. Here's what's live right now.
        </p>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 pt-12">
      <h2 class="flex items-center gap-3 font-pixel text-2xl font-semibold">
        <span
          class="size-2.5 rounded-full bg-accent"
          aria-hidden="true"
        />
        Active projects
      </h2>
      <p class="mt-1 text-sm text-muted">
        Maintained and getting updates.
      </p>
      <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProjectCard
          v-for="p in active"
          :key="p.name"
          :project="p"
        />
      </div>
    </section>

    <section
      v-if="archived.length"
      class="mx-auto max-w-6xl px-4 py-12"
    >
      <div class="border-t border-line pt-10">
        <h2 class="font-pixel text-2xl font-semibold text-muted">
          Archived
        </h2>
        <p class="mt-1 text-sm text-muted">
          No longer maintained, but kept online for anyone still using them.
        </p>
        <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ProjectCard
            v-for="p in archived"
            :key="p.name"
            :project="p"
          />
        </div>
      </div>
    </section>
  </div>
</template>
