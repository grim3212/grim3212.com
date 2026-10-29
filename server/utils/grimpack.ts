import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Reads the Grim Pack documentation exactly as the mod exported it (public/assets/grimpack, see
// scripts/import-grimpack.mjs) and shapes it for the pages. The export itself is never edited:
// every cleanup happens here, at build time.

export const EXPORT = 'documentation/Grim Pack-1.12.2-5.2.12.73-en_us.json'

/* eslint-disable @typescript-eslint/no-explicit-any -- the export has no schema of its own */
type Raw = any

export interface Item {
  name: string
  /** Icon folder; `${icon}/32.png` always exists. */
  icon: string
  /** Whether 64.png (sharp screens) and 160.png (showcases) exist too. */
  large: boolean
  tooltip?: string[]
  oreName?: string
  href?: string
}
export interface Stack { item: string, amount?: number }
export interface Recipe {
  type: string
  name: string
  output: Stack
  /** Crafting: a 3x3 grid, row by row, null for empty slots. */
  grid?: (Stack | null)[]
  /** Smelting and machines. */
  input?: Stack
  xp?: number
}
export interface Page {
  id?: string
  name: string
  html?: string
  recipes?: Recipe[]
  stacks?: Stack[]
  images?: string[]
}
export interface ConfigEntry {
  name: string
  comment?: string
  type?: string
  defaults?: string[]
  min?: number
  max?: number
  mcRestart?: boolean
  worldRestart?: boolean
  children?: ConfigEntry[]
}
export interface Chapter {
  id: string
  name: string
  info?: string
  images?: string[]
  pages?: Page[]
  config?: ConfigEntry[]
}

const dir = () => useRuntimeConfig().grimpackDir as string

let cache: Raw
function raw(): Raw {
  cache ??= JSON.parse(readFileSync(join(dir(), EXPORT), 'utf8'))
  return cache
}

// --- HTML -------------------------------------------------------------------------------------

// The export's HTML uses <font> tags and the old site's Bootstrap classes; map them onto this site's.
const FONT_COLORS: Record<string, string> = { blue: 'gp-accent', red: 'gp-warn', gold: 'gp-gold' }
const CLASSES: Record<string, string> = {
  'text-info': 'gp-accent',
  'text-primary': 'gp-accent',
  'text-danger': 'gp-warn',
  'text-secondary': 'gp-muted',
}

/** Where a picture reference in the export points. A bare file name means the images folder. */
const assetPath = (url: string) => (url.includes('/') ? url.replace(/^\/?assets\/grimpack\//, '') : `images/${url}`)
const hasAsset = (rel: string) => existsSync(join(dir(), rel))

export function cleanHtml(html: string) {
  return html
    .replace(/<font color=['"]?(\w+)['"]?>/g, (_, c: string) => `<span class="${FONT_COLORS[c] ?? ''}">`)
    .replace(/<\/font>/g, '</span>')
    // Boxes around code samples become notes.
    .replace(/<div class="card[^"]*">\s*<div class="card-body">/g, '<div class="gp-note"><div>')
    .replace(/\sclass="([^"]*)"/g, (_, cls: string) => {
      const kept = cls.split(/\s+/).map(c => CLASSES[c]).filter(Boolean)
      return kept.length ? ` class="${[...new Set(kept)].join(' ')}"` : ''
    })
    .replace(/(src|href)="\/?assets\//g, '$1="/assets/')
    // Links that have moved since the export was made.
    .replace(/https?:\/\/minecraft\.curseforge\.com\/projects\//g, 'https://www.curseforge.com/minecraft/mc-mods/')
    .replace(/https?:\/\/minecraft\.gamepedia\.com\//g, 'https://minecraft.wiki/w/')
    .replace(/http:\/\/files\.minecraftforge\.net\//g, 'https://files.minecraftforge.net/')
    .trim()
}

function info(value: string | undefined) {
  if (!value) return undefined
  return cleanHtml(value.endsWith('.html') ? readFileSync(join(dir(), assetPath(value)), 'utf8') : value)
}

function images(urls: string[] | undefined) {
  const found = (urls ?? []).map(assetPath).filter(hasAsset).map(rel => `/assets/grimpack/${rel}`)
  return found.length ? found : undefined
}

// --- Items and recipes ------------------------------------------------------------------------

/** "core:aluminum.aluminum" (part:chapter.page) -> /grim-pack/core/aluminum#aluminum */
function linkHref(link: string | undefined) {
  if (!link) return undefined
  const [part, rest = ''] = link.split(':')
  const [chapter, ...page] = rest.split('.')
  return `/grim-pack/${part}/${chapter}${page.length ? `#${page.join('.')}` : ''}`
}

const itemKey = (s: Raw) => `${s.id}@${s.meta}`

function toItem(s: Raw): Item {
  const [ns, name] = String(s.id).split(':')
  const icon = `icons/${ns}/${name}/${s.meta}`
  return {
    name: s.name,
    icon: `/assets/grimpack/${icon}`,
    large: hasAsset(`${icon}/64.png`),
    // The first line repeats the name.
    ...(s.tooltip?.length > 1 ? { tooltip: s.tooltip.slice(1).map(cleanHtml) } : {}),
    ...(s.oreName ? { oreName: s.oreName } : {}),
    ...(s.link ? { href: linkHref(s.link) } : {}),
  }
}

/** Collects the items a chapter shows; the most complete tooltip wins when they differ. */
class Items {
  all: Record<string, Item> = {}
  add(s: Raw): Stack | null {
    if (!s || s.id === 'empty') return null
    const key = itemKey(s)
    const item = toItem(s)
    const prev = this.all[key]
    if (!prev || (item.tooltip?.length ?? 0) > (prev.tooltip?.length ?? 0)) this.all[key] = item
    return { item: key, ...(s.amount > 1 ? { amount: s.amount } : {}) }
  }
}

function recipe(r: Raw, items: Items): Recipe {
  const base = { type: r.recipeType, name: raw()[r.recipeType] ?? r.recipeType, output: items.add(r.output)! }
  if (r.inputs) {
    // Inputs carry their slot (posX, posY); empty slots have none, so place by position.
    const grid: (Stack | null)[] = Array(9).fill(null)
    r.inputs.forEach((i: Raw, n: number) => {
      if (i.id === 'empty') return
      const slot = i.posX !== undefined && i.posY !== undefined ? i.posY * 3 + i.posX : n
      grid[slot] = items.add(i)
    })
    return { ...base, grid }
  }
  return { ...base, input: items.add(r.input)!, ...(r.xp ? { xp: r.xp } : {}) }
}

function configEntry(e: Raw): ConfigEntry {
  const common = { name: e.name, ...(e.comment ? { comment: e.comment } : {}) }
  if (e.children) return { ...common, children: e.children.map(configEntry) }
  return {
    ...common,
    type: String(e.type).toLowerCase() + (e.defaults?.length > 1 ? ' list' : ''),
    defaults: e.defaults ?? [],
    ...(e.minvalue !== undefined ? { min: e.minvalue, max: e.maxvalue } : {}),
    ...(e.mcrestart ? { mcRestart: true } : {}),
    ...(e.worldrestart ? { worldRestart: true } : {}),
  }
}

// --- What the pages ask for -------------------------------------------------------------------

export function grimpackNav() {
  const d = raw()
  const parts = d.parts as Raw[]
  return {
    meta: {
      version: d.version as string,
      mcVersion: d.mcversion as string,
      forgeVersion: d.forgeversion as string,
      jeiVersion: d.jeiversion as string,
      jerVersion: d.jerversion as string,
      generated: new Date(d.generated).toISOString().slice(0, 10),
    },
    stats: {
      parts: parts.length,
      chapters: parts.reduce<number>((n, p) => n + p.chapters.length, 0),
      pages: parts.reduce<number>((n, p) => n + p.chapters.reduce((m: number, c: Raw) => m + c.pages.length, 0), 0),
    },
    parts: parts.map(p => ({
      id: p.id as string,
      name: p.name as string,
      extra: Boolean(p.extra),
      chapters: (p.chapters as Raw[]).map(c => ({ id: c.id as string, name: c.name as string, config: Boolean(c.config) })),
    })),
  }
}

function findPart(id: string) {
  const part = (raw().parts as Raw[]).find(p => p.id === id)
  if (!part) throw createError({ statusCode: 404, statusMessage: 'Part not found' })
  return part
}

export function grimpackPart(id: string) {
  const p = findPart(id)
  return { id: p.id as string, name: p.name as string, info: info(p.info), images: images(p.imageUrls) }
}

export function grimpackChapter(partId: string, chapterId: string) {
  const p = findPart(partId)
  const c = (p.chapters as Raw[]).find(c => c.id === chapterId)
  if (!c) throw createError({ statusCode: 404, statusMessage: 'Chapter not found' })
  const items = new Items()
  const chapter: Chapter = { id: c.id, name: c.name, info: info(c.info), images: images(c.imageUrls) }
  if (c.config) chapter.config = c.pages.map(configEntry)
  else {
    chapter.pages = c.pages.map((g: Raw): Page => ({
      ...(g.id ? { id: g.id } : {}),
      name: g.name,
      html: info(g.info),
      recipes: g.recipes?.map((r: Raw) => recipe(r, items)),
      stacks: g.displayStacks?.map((s: Raw) => items.add(s)!),
      images: images(g.imageUrls),
    }))
  }
  return { part: { id: p.id as string, name: p.name as string }, chapter, items: items.all }
}
