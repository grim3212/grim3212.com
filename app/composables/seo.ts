// Title, description and link-preview tags for a page. The canonical URL and the site-wide tags are
// set once in app.vue.
export function usePageSeo(opts: { title: string, description: string, image?: string, titleTemplate?: string | null }) {
  const site = useSiteConfig()
  const image = new URL(opts.image ?? DEFAULT_IMAGE, site.url).href
  useHead({ titleTemplate: opts.titleTemplate === undefined ? undefined : opts.titleTemplate })
  useSeoMeta({
    title: opts.title,
    description: opts.description,
    ogTitle: opts.title,
    ogDescription: opts.description,
    ogImage: image,
    twitterTitle: opts.title,
    twitterDescription: opts.description,
    twitterImage: image,
  })
}

/** Shown when a page has no picture of its own. */
export const DEFAULT_IMAGE = '/assets/grimpack/images/grimpack.png'

/** Plain text from HTML, cut to a search-result-sized description at a word boundary. */
export function summarize(html: string | undefined, fallback: string, max = 155) {
  const text = (html ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length < 40) return fallback
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}
