<script setup lang="ts">
const route = useRoute()
const partId = route.params.part as string
const chapterId = route.params.chapter as string
const { data, error } = await useFetch(`/api/grimpack/chapter/${partId}/${chapterId}`, {
  key: `grimpack-${partId}-${chapterId}`,
})
if (error.value || !data.value) throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

provide(ITEMS, computed(() => data.value?.items ?? {}))
const chapter = computed(() => data.value!.chapter)
const firstPage = chapter.value.pages?.find(p => p.html)
usePageSeo({
  title: `${chapter.value.name} · ${data.value.part.name} · Grim Pack`,
  titleTemplate: null,
  description: summarize(
    chapter.value.info ?? firstPage?.html,
    chapter.value.config
      ? `Every ${data.value.part.name} config option in the Grim Pack Minecraft mod, with its default.`
      : `${chapter.value.name} in the ${data.value.part.name} part of the Grim Pack Minecraft mod.`,
  ),
  image: chapter.value.images?.[0] ?? chapter.value.pages?.find(p => p.images)?.images?.[0],
})
</script>

<template>
  <article v-if="data">
    <NuxtLink
      :to="`/grim-pack/${partId}`"
      class="font-pixel text-sm text-accent hover:underline"
    >
      {{ data.part.name }}
    </NuxtLink>
    <h1 class="font-pixel text-4xl font-semibold">
      {{ chapter.name }}
    </h1>
    <GpHtml
      v-if="chapter.info"
      :html="chapter.info"
      class="mt-4 max-w-3xl"
    />
    <GpGallery
      v-if="chapter.images"
      :images="chapter.images"
      class="mt-6"
    />

    <div
      v-if="chapter.config"
      class="mt-8 space-y-4"
    >
      <GpConfig
        v-for="entry in chapter.config"
        :key="entry.name"
        :entry="entry"
      />
    </div>

    <div
      v-else
      class="mt-8 space-y-6"
    >
      <section
        v-for="(page, i) in chapter.pages"
        :id="page.id"
        :key="page.id ?? i"
        class="rounded-xl border border-line bg-surface p-5 sm:p-6"
      >
        <h2 class="font-pixel text-2xl font-semibold">
          <a
            v-if="page.id"
            :href="`#${page.id}`"
            class="hover:text-accent"
          >{{ page.name }}</a>
          <template v-else>
            {{ page.name }}
          </template>
        </h2>
        <GpHtml
          v-if="page.html"
          :html="page.html"
          class="mt-3"
        />
        <div
          v-if="page.stacks"
          class="mt-5 flex flex-wrap gap-4"
        >
          <GpItem
            v-for="(s, n) in page.stacks"
            :key="n"
            :stack="s"
            size="showcase"
          />
        </div>
        <div
          v-if="page.recipes"
          class="mt-5 flex flex-wrap gap-4"
        >
          <GpRecipe
            v-for="(r, n) in page.recipes"
            :key="n"
            :recipe="r"
          />
        </div>
        <GpGallery
          v-if="page.images"
          :images="page.images"
          class="mt-5"
        />
      </section>
    </div>
  </article>
</template>
