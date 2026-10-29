// Copies the Grim Pack documentation from the old site (the master-archive branch) into this one.
//
//   node scripts/import-grimpack.mjs [git ref]   (default: master-archive)
//
// The documentation JSON is exported from Minecraft by the mod and is copied byte for byte, never
// edited: the site reads it as it is (see server/utils/grimpack.ts). The same goes for the HTML
// pages it points to, the pictures, and the icons of every item it shows. Everything lands under
// public/assets/grimpack at the same paths as on the old site, so old links keep working.
// To publish a new export, add its JSON to EXPORT below (or drop it in by hand) and rebuild.
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const REF = process.argv[2] || 'master-archive'
export const EXPORT = 'documentation/Grim Pack-1.12.2-5.2.12.73-en_us.json'
// Item icons come in several sizes; the site uses these (2x for sharp screens, 160 for showcases).
const ICON_SIZES = [32, 64, 160]

const root = fileURLToPath(new URL('..', import.meta.url))
const dest = join(root, 'public/assets/grimpack')

// Unpack the old assets once instead of reading thousands of files one by one. Line-ending
// conversion is turned off so every file comes out exactly as it was committed.
const tmp = mkdtempSync(join(tmpdir(), 'grimpack-'))
const archive = execFileSync('git', ['-c', 'core.autocrlf=false', '-c', 'core.eol=lf', 'archive', REF, 'src/assets/grimpack'],
  { cwd: root, maxBuffer: 1 << 30 })
writeFileSync(join(tmp, 'assets.tar'), archive)
execFileSync('tar', ['-xf', 'assets.tar'], { cwd: tmp })
const src = join(tmp, 'src/assets/grimpack')

// Where a picture reference in the export points, relative to assets/grimpack. A bare file name
// (the export has one) means the images folder; server/utils/grimpack.ts resolves it the same way.
const assetPath = url => (url.includes('/') ? url.replace(/^\/?assets\/grimpack\//, '') : `images/${url}`)

const copied = new Set()
const missing = new Set()
// The export and its own files must be there. A picture or icon the old site never had (it showed
// a broken image) is reported and left out; the site skips it too.
function copy(rel, { required = false, optional = false } = {}) {
  if (copied.has(rel)) return
  const from = join(src, rel)
  if (!existsSync(from)) {
    if (required) throw new Error(`missing ${rel}`)
    if (!optional) missing.add(rel)
    return
  }
  mkdirSync(dirname(join(dest, rel)), { recursive: true })
  copyFileSync(from, join(dest, rel))
  copied.add(rel)
}

copy(EXPORT, { required: true })
const doc = JSON.parse(readFileSync(join(src, EXPORT), 'utf8'))

// Walk the export for what it references: HTML pages, pictures and item stacks.
JSON.stringify(doc, (key, value) => {
  if (key === 'info' && typeof value === 'string' && value.endsWith('.html')) copy(assetPath(value), { required: true })
  if (key === 'imageUrls') value.forEach(u => copy(assetPath(u)))
  if (typeof value === 'string') {
    for (const [, img] of value.matchAll(/src=["']\/?assets\/grimpack\/([^"']+)/g)) copy(img)
  }
  if (value && typeof value === 'object' && typeof value.id === 'string' && value.id.includes(':') && 'meta' in value) {
    const [ns, name] = value.id.split(':')
    // The smallest icon must exist; a few items have no larger ones.
    ICON_SIZES.forEach((size, i) => copy(`icons/${ns}/${name}/${value.meta}/${size}.png`, { optional: i > 0 }))
  }
  return value
})

rmSync(tmp, { recursive: true, force: true })
console.log(`copied ${copied.size} files into public/assets/grimpack`)
if (missing.size) console.log(`not in the old site either (left out): ${[...missing].join(', ')}`)
