// The projects on the home page, in the order shown. Add an entry here to list a new one: `to` for a
// page on this site, `href` for somewhere else.
export interface Project {
  name: string
  blurb: string
  to?: string
  href?: string
  /** A picture under /public, shown on the card. */
  image?: string
  /** Screenshots fill the card (the default); a logo is shown whole. */
  imageFit?: 'cover' | 'contain'
  tags?: string[]
  /** Active projects are maintained; archived ones stay up as they are. */
  status: 'active' | 'archived'
  /** For an archived project: what replaced it. */
  successor?: string
}

export const projects: Project[] = [
  {
    name: 'Assorted Mods',
    blurb:
      'The Assorted mod series for modern Minecraft: tech, decor, storage, tools, world generation and more, '
      + 'split into small mods you can pick and choose. The spiritual successor to Grim Pack.',
    href: 'https://assortedmods.com',
    image: '/projects/assortedmods.webp',
    tags: ['Minecraft', 'NeoForge', 'Fabric'],
    status: 'active',
  },
  {
    name: 'Anime Dub Status',
    blurb: 'Find out if an anime has an English dub, and see which dubs are airing this week.',
    href: 'https://animedubstatus.com',
    image: '/projects/animedubstatus.png',
    imageFit: 'contain',
    tags: ['Web app'],
    status: 'active',
  },
  {
    name: 'Grim Pack',
    blurb:
      'A Minecraft mod collecting blocks, items, mobs, machines and world generation from many classic mods. '
      + 'Its full documentation stays here for anyone still playing it.',
    to: '/grim-pack',
    image: '/assets/grimpack/images/grimpack.png',
    tags: ['Minecraft 1.12.2', 'Forge'],
    status: 'archived',
    successor: 'Assorted Mods',
  },
]

/** Where Grim Pack players are pointed for the modern version. */
export const GRIM_PACK_SUCCESSOR = { name: 'Assorted Mods', href: 'https://assortedmods.com' }
