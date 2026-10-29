<script setup lang="ts">
const { data: nav } = await useGrimpackNav()
useSeoMeta({
  title: 'Grim Pack documentation',
  description: 'Documentation for the Grim Pack Minecraft mod: every part, block, item and recipe, plus its config options.',
})

const curseforge = 'https://www.curseforge.com/minecraft/mc-mods/grim-pack'
</script>

<template>
  <div v-if="nav">
    <h1 class="font-pixel text-4xl font-semibold sm:text-5xl">
      Grim Pack
    </h1>
    <p class="mt-3 max-w-2xl text-muted">
      Everything in the pack, taken straight from its in-game instruction manual: what each part adds,
      how to craft it, and how to configure it.
    </p>

    <dl class="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line text-sm sm:grid-cols-4">
      <div class="bg-surface p-4">
        <dt class="text-muted">
          Mod version
        </dt>
        <dd class="font-pixel text-lg">
          {{ nav.meta.version }}
        </dd>
      </div>
      <div class="bg-surface p-4">
        <dt class="text-muted">
          Minecraft
        </dt>
        <dd class="font-pixel text-lg">
          {{ nav.meta.mcVersion }}
        </dd>
      </div>
      <div class="bg-surface p-4">
        <dt class="text-muted">
          Forge
        </dt>
        <dd class="font-pixel text-lg">
          {{ nav.meta.forgeVersion }}
        </dd>
      </div>
      <div class="bg-surface p-4">
        <dt class="text-muted">
          Optional
        </dt>
        <dd>JEI {{ nav.meta.jeiVersion }}<br>JER {{ nav.meta.jerVersion }}</dd>
      </div>
    </dl>
    <p class="mt-3 text-xs text-muted">
      {{ nav.stats.parts }} parts, {{ nav.stats.chapters }} chapters and {{ nav.stats.pages }} sections.
      Generated from the mod on {{ nav.meta.generated }}.
      <a
        :href="curseforge"
        class="text-accent underline"
      >Download on CurseForge</a>
    </p>

    <div class="mt-10 grid gap-4 sm:grid-cols-2">
      <NuxtLink
        v-for="part in nav.parts"
        :key="part.id"
        :to="`/grim-pack/${part.id}`"
        class="group rounded-xl border border-line p-5 transition hover:border-accent"
        :class="part.extra ? 'bg-accent-soft sm:col-span-2' : 'bg-surface'"
      >
        <h2 class="font-pixel text-xl font-semibold group-hover:text-accent">
          {{ part.name }}
        </h2>
        <p class="mt-1 text-sm text-muted">
          {{ part.chapters.length }} chapters
          <template v-if="part.extra">
            · installing, configuring, recipes and the changelog
          </template>
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
