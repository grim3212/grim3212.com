<script setup lang="ts">
// Site-wide head: every page's title ends in the site name (pages can override it), and each page
// gets a canonical URL without a trailing slash, matching the sitemap.
const route = useRoute()
const site = useSiteConfig()
const canonical = computed(() => new URL(route.path.replace(/\/+$/, '') || '/', site.url).href)

useHead({
  titleTemplate: '%s · Grim3212',
  link: [{ rel: 'canonical', href: canonical }],
  meta: [{ name: 'theme-color', content: '#0e1311' }],
})
useSeoMeta({
  ogSiteName: 'Grim3212',
  ogType: 'website',
  ogUrl: canonical,
  ogLocale: 'en_US',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
