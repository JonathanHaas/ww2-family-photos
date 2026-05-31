# WW2 Family Photos

A standalone static site for sharing family World War II photos.

## Files

- `public/index.html`: About and Photos page structure
- `templates/partials/footer.html`: shared footer source
- `scripts/build-static.js`: injects shared partials into static HTML
- `public/styles.css`: responsive layout, gallery, and parallax/sepia treatment
- `public/script.js`: simple gallery lightbox behavior
- `src/index.js`: Cloudflare Worker for protected uploads and gallery APIs
- `wrangler.jsonc`: Cloudflare Workers Static Assets and KV configuration

## Build

Run `npm run build` after editing shared partials. The build keeps the deployed
HTML static by replacing the generated footer block in each public page.

Use `npm run deploy` to build and deploy together.

## Uploads

The deployed site stores gallery metadata and uploaded photos in Cloudflare Workers KV through the `ARCHIVE_KV` binding. The upload console is available at `/admin` and uses the `ADMIN_PASSWORD` Worker secret.

## Placeholder Image

The temporary parallax background uses a National Archives World War II photo:

https://www.archives.gov/files/research/still-pictures/ww2-111-sc-407101.jpeg

National Archives source page:

https://www.archives.gov/research/military/ww2/photos

The National Archives page states the selected photographs are public domain and have no use restrictions. Replace the image URL in `public/styles.css` when a family background photo is ready.
