<script setup lang="ts">
// The site is built ahead of time, so this is the year of the last deploy.
const year = new Date().getFullYear()
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <a
      href="#content"
      class="sr-only z-50 rounded-lg bg-accent px-4 py-2 font-medium text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >Skip to content</a>
    <header class="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
      <nav
        class="relative mx-auto flex h-14 max-w-6xl items-center gap-6 px-4"
        aria-label="Main"
      >
        <NuxtLink
          to="/"
          class="font-pixel text-xl font-semibold tracking-wide"
        >
          Grim<span class="text-accent">3212</span>
        </NuxtLink>
        <SiteNav />
      </nav>
    </header>
    <main
      id="content"
      class="flex-1"
    >
      <slot />
    </main>
    <footer class="border-t border-line">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted">
        <span>© {{ year }} Dakota Pierone</span>
        <a
          href="https://github.com/grim3212"
          class="hover:text-ink"
        >GitHub</a>
      </div>
    </footer>
  </div>
</template>
