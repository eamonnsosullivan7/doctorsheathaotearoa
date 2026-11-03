# Doctors Health Aotearoa

Astro rebuild of [doctorshealth.co.nz](https://www.doctorshealth.co.nz) (previously Webflow), with content in Sanity.

- **Site:** Astro, static output, served by a Cloudflare Worker (static assets) — preview at https://doctorsheathaotearoa.eamonnsosullivan.workers.dev
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
| `event`           | Home (next 3 upcoming), `/events` (upcoming, then past by year), `/event/<slug>` |
| `news`            | `/news` (most recent is featured, earlier items listed by year) |
| `teamMember`      | `/about` "Meet Our Team", sorted by `order` |
| `supportCategory` | `/support` sections, sorted by `order`     |
| `supportResource` | `/support` collapsible entries, sorted by `order` within their category. Each has an intro plus optional `entries` (services, podcasts, books, papers…): title-and-link-only entries render as a compact link grid, entries with a byline or description render as cards |

The static page copy (home, about, contact, donate intros) lives in the `.astro` files.

## Deployment

The site is hosted as a Cloudflare Worker serving the built `dist` folder, configured in `wrangler.jsonc` (clean URLs without trailing slashes, and the site's own 404 page). The Worker is connected to this GitHub repository and rebuilds on every push to `main`.

Worker settings (Cloudflare → Workers & Pages → the Worker → Settings → Build):

- **Build command:** `npm run build`; **deploy command:** `npx wrangler deploy`
- **Build variables:** `PUBLIC_WEB3FORMS_ACCESS_KEY` (the forms need it at build time) and `NODE_VERSION` = `22`
- **Deploy hook:** "Sanity publish", used by the two rebuild triggers below

Rebuild triggers:

- **Publishing in Sanity** — a webhook (sanity.io/manage → API → Webhooks) calls the deploy hook when an event, news item, team member or support item is created, updated or deleted.
- **Nightly** — `.github/workflows/daily-rebuild.yml` calls the deploy hook (repository secret `CLOUDFLARE_DEPLOY_HOOK`) so events move from upcoming to past on time, as that split is worked out at build time. It can also be run by hand from the repo's Actions tab.

Any URL that serves `/studio` must be in Sanity's CORS origins **with credentials** for the Studio login to work:

```sh
npx sanity cors add https://<domain> --credentials
```

When moving `doctorshealth.co.nz` from Webflow, add the domain under the Worker's custom domains and to Sanity CORS.
