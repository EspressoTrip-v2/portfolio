# Juan Botha — personal site

Single-page portfolio built with Next.js 16 (App Router), Tailwind CSS v4 and Motion.

## Run locally

```bash
pnpm install
pnpm dev        # http://localhost:3030
```

Production build:

```bash
pnpm build
pnpm start      # http://localhost:3030
```

## Editing content

All copy lives in `src/content/profile.ts`, which covers the profile, stats, experience, case study, principles, skills and projects. Section names and their order live in `src/content/navigation.ts`, which drives both the nav and the command palette.

- **Add a portfolio project:** append to `projects` with `status: "live"` and an `href`. Entries with `status: "coming-soon"` render as placeholder cards.
- **Company links:** set `links` on an `experience` entry. Each link renders with an external-link arrow.
- **Availability badge:** set `profile.available` and `profile.availability`.
- **Portrait:** replace `public/juan.jpg`. The duotone effect is applied in CSS and the original colours show on hover. The share image uses `src/assets/og-portrait.png`, a pre-rendered duotone version of the same photo.

## Features

- **⌘K / Ctrl K / `/`** opens a command palette for jumping to sections, copying the email address and opening profile links.
- `src/app/opengraph-image.tsx` generates the social share card at build time. `twitter-image.tsx` reuses it.

## Structure

- `src/app/` holds the layout, fonts, metadata, share images, global theme tokens (`globals.css`) and the favicon.
- `src/components/` has one component per page section, plus shared `Section`, `Reveal`, `Background`, `ScrambleText`, `CommandPalette` and `Icons`.
