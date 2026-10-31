# Doctors Health Aotearoa

Astro rebuild of [doctorshealth.co.nz](https://www.doctorshealth.co.nz) (previously Webflow), with content in Sanity.

- **Site:** Astro, static output, deployed to Cloudflare Pages
- **CMS:** Sanity project `mq6n6kkq`, dataset `production`, Studio embedded at `/studio`
- **Forms:** plain HTML posting to [Web3Forms](https://web3forms.com)

## Getting started

```sh
npm install
cp .env.example .env   # add the Web3Forms access key
npm run dev            # http://localhost:4321, Studio at http://localhost:4321/studio
```

| Command                 | What it does                                   |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | Dev server                                     |
| `npm run build`         | Static build to `dist/`                        |
| `npm run preview`       | Serve the build locally                        |
| `npm run check`         | Type-check `.astro` and `.ts` files            |

## Project layout

```
src/
  pages/              One file per route; /event/[slug] is generated from Sanity
  layouts/            BaseLayout (head, header, footer, scroll-reveal script)
  components/         Header, footer, cards, rich text, forms
  styles/             tokens.css (design tokens), global.css (base, layout), form.css
  sanity/
    schemaTypes/      Content model
    structure.ts      Studio sidebar
    lib/              GROQ queries + image URL helpers
sanity.config.ts      Studio config
```

CSS uses BEM class names (`block__element--modifier`). Each component keeps its own styles in a scoped `<style>` block; only design tokens, base styles and layout primitives (`.container`, `.section`, `.button`) are global.

All colours, font sizes, weights, spacing, radii and shadows are defined once in `src/styles/tokens.css` and used through `var(--…)`. Change a value there to change it site-wide, and use an existing token rather than a raw value when adding styles. Headings are written in Title Case.

## Content model

| Type              | Used on                                    |
| ----------------- | ------------------------------------------ |
| `event`           | Home (latest 4), `/events`, `/event/<slug>` |
| `news`            | `/news` (most recent is featured)          |
| `teamMember`      | `/about` "Meet Our Team", sorted by `order` |
| `supportCategory` | `/support` sections, sorted by `order`     |
| `supportResource` | `/support` collapsible entries, sorted by `order` within their category. Each has an intro plus optional `entries` (services, podcasts, books, papers…): title-and-link-only entries render as a compact link grid, entries with a byline or description render as cards |

The static page copy (home, about, contact, donate intros) lives in the `.astro` files.

## Deploying to Cloudflare Pages

1. Connect the repository in Cloudflare Pages: build command `npm run build`, output directory `dist`.
2. Set the `PUBLIC_WEB3FORMS_ACCESS_KEY` environment variable.
3. Create a deploy hook (Settings → Builds → Deploy hooks) and add it as a Sanity webhook
   (sanity.io/manage → API → Webhooks) so publishing content triggers a rebuild.
4. Add the production URL to Sanity's CORS origins **with credentials** so `/studio` can log in:
   `npx sanity cors add https://<your-domain> --credentials`

Past/upcoming event badges are worked out at build time, so a scheduled rebuild (e.g. a daily cron hitting the deploy hook) keeps them current.
