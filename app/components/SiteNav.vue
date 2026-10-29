<script setup lang="ts">
import { projects } from '~/data/projects'

// The header lists the active projects, with archived ones in a dropdown. On small screens
// everything folds into one menu. Both come from app/data/projects.ts.
const active = projects.filter(p => p.status === 'active')
const archived = projects.filter(p => p.status === 'archived')

const route = useRoute()
const archivedOpen = ref(false)
const menuOpen = ref(false)
const root = ref<HTMLElement>()

const isCurrent = (p: { to?: string }) => Boolean(p.to && (route.path === p.to || route.path.startsWith(`${p.to}/`)))
const archivedCurrent = computed(() => archived.some(isCurrent))

function close() {
  archivedOpen.value = false
  menuOpen.value = false
}
watch(() => route.path, close)

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) close()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div
    ref="root"
    class="ml-auto flex items-center gap-5 text-sm"
  >
    <!-- Wide screens: active projects, then the archived dropdown. -->
    <ul class="hidden items-center gap-5 sm:flex">
      <li
        v-for="p in active"
        :key="p.name"
      >
        <NuxtLink
          :to="p.to ?? p.href"
          class="hover:text-ink"
          :class="isCurrent(p) ? 'font-medium text-ink' : 'text-muted'"
        >
          {{ p.name }}
        </NuxtLink>
      </li>
      <li
        v-if="archived.length"
        class="relative"
      >
        <button
          type="button"
          class="flex items-center gap-1 hover:text-ink"
          :class="archivedCurrent ? 'font-medium text-ink' : 'text-muted'"
          :aria-expanded="archivedOpen"
          aria-controls="nav-archived"
          @click="archivedOpen = !archivedOpen"
        >
          Archived
          <svg
            viewBox="0 0 12 12"
            class="size-3 transition"
            :class="archivedOpen ? 'rotate-180' : ''"
            aria-hidden="true"
          ><path
            d="M2 4.5 6 8l4-3.5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          /></svg>
        </button>
        <ul
          v-show="archivedOpen"
          id="nav-archived"
          class="absolute right-0 mt-3 w-64 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-lg"
        >
          <li
            v-for="p in archived"
            :key="p.name"
          >
            <NuxtLink
              :to="p.to ?? p.href"
              class="block rounded-lg px-3 py-2 hover:bg-surface-2"
            >
              <span class="block font-medium text-ink">{{ p.name }}</span>
              <span
                v-if="p.successor"
                class="block text-xs text-muted"
              >No longer maintained. Succeeded by {{ p.successor }}.</span>
            </NuxtLink>
          </li>
        </ul>
      </li>
    </ul>

    <!-- Small screens: one menu with both groups. -->
    <div class="sm:hidden">
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5"
        :aria-expanded="menuOpen"
        aria-controls="nav-menu"
        @click="menuOpen = !menuOpen"
      >
        Projects
        <span aria-hidden="true">{{ menuOpen ? '−' : '+' }}</span>
      </button>
      <div
        v-show="menuOpen"
        id="nav-menu"
        class="absolute inset-x-4 top-14 mt-2 rounded-xl border border-line bg-surface p-3 shadow-lg"
      >
        <p class="px-2 text-xs font-medium tracking-wide text-muted uppercase">
          Active
        </p>
        <NuxtLink
          v-for="p in active"
          :key="p.name"
          :to="p.to ?? p.href"
          class="block rounded-lg px-2 py-2 font-medium hover:bg-surface-2"
        >
          {{ p.name }}
        </NuxtLink>
        <template v-if="archived.length">
          <p class="mt-3 border-t border-line px-2 pt-3 text-xs font-medium tracking-wide text-muted uppercase">
            Archived
          </p>
          <NuxtLink
            v-for="p in archived"
            :key="p.name"
            :to="p.to ?? p.href"
            class="block rounded-lg px-2 py-2 hover:bg-surface-2"
          >
            <span class="block font-medium">{{ p.name }}</span>
            <span
              v-if="p.successor"
              class="block text-xs text-muted"
            >Succeeded by {{ p.successor }}</span>
          </NuxtLink>
        </template>
      </div>
    </div>

    <a
      href="https://github.com/grim3212"
      class="text-muted hover:text-ink"
      aria-label="GitHub"
      title="GitHub"
    >
      <svg
        viewBox="0 0 16 16"
        class="size-5"
        fill="currentColor"
        aria-hidden="true"
      ><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" /></svg>
    </a>
  </div>
</template>
