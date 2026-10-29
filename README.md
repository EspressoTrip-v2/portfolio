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

## Deploy to Vercel

The site is fully static: every route, including the share images, `robots.txt` and `sitemap.xml`, is prerendered at build time.

1. In Vercel, choose **Add New → Project** and import `EspressoTrip-v2/portfolio`.
2. Keep the detected defaults: the Next.js framework preset, `pnpm install` and `next build`. Node.js 24 is pinned through `engines` in `package.json`.
3. Deploy.

**Site URL.** `src/config/site.ts` resolves the public URL used for canonical links, Open Graph images and the sitemap:

| Environment | URL used | Indexed by search engines |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` set | That value | Yes |
| Vercel production | `https://<production domain>` (`VERCEL_PROJECT_PRODUCTION_URL`) | Yes |
| Vercel preview | `https://<deployment URL>` (`VERCEL_URL`) | No |
| Local | `http://localhost:3030` | No |

After adding a custom domain, either make it the production domain in Vercel or set `NEXT_PUBLIC_SITE_URL` (for example `https://juanbotha.dev`) in the project's environment variables, then redeploy.

**Headers.** `next.config.ts` adds `nosniff`, `DENY` framing, a strict referrer policy and a restrictive permissions policy to every response. Vercel adds HSTS itself.

## Editing content

All copy lives in `src/content/profile.ts`, which covers the profile, stats, experience, case study, principles, skills and projects. Section names and their order live in `src/content/navigation.ts`, which drives both the nav and the command palette.

- **Add a portfolio project:** append to `projects` with a `name`, `description`, `stack` and `href`. The first project is the featured card; the rest render as compact cards beneath it.
- **Company links:** set `links` on an `experience` entry. Each link renders with an external-link arrow.
- **Availability badge:** set `profile.available` and `profile.availability`.
- **Portrait:** replace `public/juan.jpg`. The duotone effect is applied in CSS and the original colours show on hover. The share image uses `src/assets/og-portrait.png`, a pre-rendered duotone version of the same photo.

## Features

- **⌘K / Ctrl K / `/`** opens a command palette for jumping to sections, copying the email address and opening profile links.
- `src/app/opengraph-image.tsx` generates the social share card at build time. `twitter-image.tsx` reuses it.

## Structure

- `src/app/` holds the layout, fonts, metadata, share images, global theme tokens (`globals.css`) and the favicon.
- `src/components/` has one component per page section, plus shared `Section`, `Reveal`, `Background`, `ScrambleText`, `CommandPalette` and `Icons`.
