<script setup lang="ts">
const route = useRoute()
const id = route.params.part as string
const { data: nav } = await useGrimpackNav()
const { data: part, error } = await useFetch(`/api/grimpack/part/${id}`, { key: `grimpack-part-${id}` })
if (error.value || !part.value) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

const chapters = computed(() => nav.value?.parts.find(p => p.id === id)?.chapters ?? [])
useSeoMeta({
  title: `${part.value.name} · Grim Pack`,
  description: `The ${part.value.name} part of the Grim Pack Minecraft mod.`,
})
</script>

<template>
  <article v-if="part">
    <p class="font-pixel text-sm text-accent">
      Grim Pack
    </p>
    <h1 class="font-pixel text-4xl font-semibold">
      {{ part.name }}
    </h1>
    <GpHtml
      v-if="part.info"
      :html="part.info"
      class="mt-4 max-w-3xl"
    />
    <GpGallery
      v-if="part.images"
      :images="part.images"
      class="mt-6"
    />

    <h2 class="mt-10 font-pixel text-2xl font-semibold">
      Chapters
    </h2>
    <ul class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="ch in chapters"
        :key="ch.id"
      >
        <NuxtLink
          :to="`/grim-pack/${id}/${ch.id}`"
          class="block rounded-lg border border-line bg-surface px-4 py-3 font-medium transition hover:border-accent hover:text-accent"
        >
          {{ ch.name }}
        </NuxtLink>
      </li>
    </ul>
  </article>
</template>
