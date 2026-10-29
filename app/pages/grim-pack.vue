<script setup lang="ts">
import { GRIM_PACK_SUCCESSOR } from '~/data/projects'

const route = useRoute()
const { data: nav } = await useGrimpackNav()
const menuOpen = ref(false)
watch(() => route.path, () => (menuOpen.value = false))

const currentPart = computed(() => route.params.part as string | undefined)
const currentChapter = computed(() => route.params.chapter as string | undefined)
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div
      role="note"
      class="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm"
    >
      <span class="rounded-full border border-line px-2 py-0.5 text-xs text-muted">Archived</span>
      <span class="text-muted">Grim Pack is no longer maintained. These docs stay up for anyone still playing it.</span>
      <a
        :href="GRIM_PACK_SUCCESSOR.href"
        class="font-medium text-accent hover:underline"
      >Its spiritual successor is {{ GRIM_PACK_SUCCESSOR.name }} →</a>
    </div>
    <div class="flex flex-col gap-8 lg:flex-row">
      <aside class="lg:w-60 lg:shrink-0">
        <div class="lg:sticky lg:top-20">
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium lg:hidden"
            :aria-expanded="menuOpen"
            aria-controls="gp-nav"
            @click="menuOpen = !menuOpen"
          >
            Contents
            <span aria-hidden="true">{{ menuOpen ? '−' : '+' }}</span>
          </button>
          <nav
            id="gp-nav"
            :class="[menuOpen ? 'block' : 'hidden', 'mt-3 lg:mt-0 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2']"
            aria-label="Grim Pack documentation"
          >
            <NuxtLink
              to="/grim-pack"
              class="font-pixel text-lg font-semibold"
              exact-active-class="text-accent"
            >
              Grim Pack
            </NuxtLink>
            <ul class="mt-3 space-y-1 text-sm">
              <li
                v-for="part in nav?.parts"
                :key="part.id"
              >
                <NuxtLink
                  :to="`/grim-pack/${part.id}`"
                  class="block rounded-md px-2 py-1 font-medium hover:bg-surface-2"
                  :class="currentPart === part.id ? 'text-accent' : ''"
                >
                  {{ part.name }}
                </NuxtLink>
                <ul
                  v-if="currentPart === part.id"
                  class="mb-2 ml-2 border-l border-line pl-2"
                >
                  <li
                    v-for="ch in part.chapters"
                    :key="ch.id"
                  >
                    <NuxtLink
                      :to="`/grim-pack/${part.id}/${ch.id}`"
                      class="block rounded-md px-2 py-0.5 hover:text-ink"
                      :class="[currentChapter === ch.id ? 'bg-accent-soft text-accent' : 'text-muted', ch.config ? 'italic' : '']"
                    >
                      {{ ch.name }}
                    </NuxtLink>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <div class="min-w-0 flex-1">
        <NuxtPage />
      </div>
    </div>
  </div>
</template>
