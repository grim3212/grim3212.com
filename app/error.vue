<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)
useSeoMeta({ title: notFound.value ? 'Page not found' : 'Something went wrong', robots: 'noindex' })
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto max-w-6xl px-4 py-24 text-center">
      <p class="font-pixel text-6xl font-semibold text-accent">
        {{ error.statusCode }}
      </p>
      <h1 class="mt-4 font-pixel text-2xl">
        {{ notFound ? "This page doesn't exist" : 'Something went wrong' }}
      </h1>
      <div class="mt-8 flex justify-center gap-4 text-sm">
        <NuxtLink
          to="/"
          class="rounded-lg border border-line px-4 py-2 hover:border-accent"
        >
          Home
        </NuxtLink>
        <NuxtLink
          to="/grim-pack"
          class="rounded-lg bg-accent px-4 py-2 font-medium text-bg"
        >
          Grim Pack docs
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>
