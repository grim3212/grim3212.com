// The projects on the home page. Add an entry here to list a new one: `to` for a page on this
// site, `href` for somewhere else.
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
}

export const projects: Project[] = [
  {
    name: 'Grim Pack',
    blurb:
      'A Minecraft mod collecting blocks, items, mobs, machines and world generation from many classic mods. '
      + 'Full documentation for every part, with recipes and config options.',
    to: '/grim-pack',
    image: '/assets/grimpack/images/grimpack.png',
    tags: ['Minecraft 1.12.2', 'Forge'],
  },
  {
    name: 'Assorted Mods',
    blurb:
      'The Assorted mod series for modern Minecraft: tech, decor, storage, tools, world generation and more, '
      + 'split into small mods you can pick and choose.',
    href: 'https://assortedmods.com',
    image: '/projects/assortedmods.webp',
    tags: ['Minecraft', 'NeoForge', 'Fabric'],
  },
  {
    name: 'Anime Dub Status',
    blurb: 'Find out if an anime has an English dub, and see which dubs are airing this week.',
    href: 'https://animedubstatus.com',
    image: '/projects/animedubstatus.png',
    imageFit: 'contain',
    tags: ['Web app'],
  },
]
