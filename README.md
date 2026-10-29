# grim3212.com

My personal site, with the documentation for the [Grim Pack](https://www.curseforge.com/minecraft/mc-mods/grim-pack)
Minecraft mod. Published at [grim3212.com](https://grim3212.com).

Built with [Nuxt 4](https://nuxt.com) and prerendered to static files.

## Setup

Needs Node 26, pinned in `.nvmrc`.

```bash
yarn install
yarn dev        # http://localhost:3000
yarn generate   # static site into .output/public
yarn lint
yarn typecheck
```

## Projects

The home page lists the projects in `app/data/projects.ts`. Add an entry there to show a new one.

## Grim Pack documentation

The pages are built from the documentation the mod exports from Minecraft, in
`public/assets/grimpack/documentation`. That export is kept exactly as the mod wrote it, never edited;
`server/utils/grimpack.ts` shapes it for the pages when the site is built. The pictures, item icons and
HTML pages it refers to sit next to it.

`yarn import:grimpack` copied all of this from the old site (kept on the `master-archive` branch). To
publish a new export, drop its JSON in, point `EXPORT` in `server/utils/grimpack.ts` at it, and rebuild.

## Deploy

Deployed to AWS with CDK. Pushes to `main` publish automatically.
