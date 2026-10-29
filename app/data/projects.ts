// The projects on the home page. Add an entry here to list a new one: `to` for a page on this
// site, `href` for somewhere else.
export interface Project {
  name: string
  blurb: string
  to?: string
  href?: string
  /** A picture under /public, shown on the card. */
  image?: string
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
]
