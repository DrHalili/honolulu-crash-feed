# Honolulu Crash Feed

Polished static website that aggregates **publicly reported** traffic crashes on Oʻahu. Ocean-blue / green Hawaii branding, mobile-friendly cards, RSS, and a practical admin helper for updating JSON on GitHub Pages.

## Features

- Public feed (`index.html`) with search + severity filters
- Seed data in `data/crashes.json` (Sept 2026 incidents)
- RSS 2.0 at `feed.xml`
- Subscribe form with Formspree **placeholder** (`action="#"`) + RSS link
- Admin page to build/download updated `crashes.json` and copy GitHub API `curl`
- Schema docs for Crash Bot in `api/README.md`

## Quick start (local)

GitHub Pages and modern browsers load `crashes.json` via `fetch`, so use a tiny static server (opening `index.html` as `file://` may block fetch):

```bash
cd honolulu-crash-feed
python3 -m http.server 8080
# → http://localhost:8080/
```

Or:

```bash
npx --yes serve .
```

## Deploy on GitHub Pages

1. Push this folder to a GitHub repo (as the repo root, or copy contents to root).
2. **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: `main` (or `master`)
   - Folder: **/ (root)** — or **/docs** if you keep the site under `docs/`
3. Wait for the Pages build; open `https://<user>.github.io/<repo>/`
4. Confirm `feed.xml` and `data/crashes.json` resolve with relative paths.

No build step required — pure HTML/CSS/JS.

## Subscribe

- **RSS:** [`feed.xml`](feed.xml) — add in Feedly, NetNewsWire, etc.
- **Email:** On `index.html`, set the form `action` to your Formspree endpoint, e.g. `https://formspree.io/f/xxxxxx`. Until then the form shows a configuration note.

## Adding crashes

1. **Preferred:** Edit `data/crashes.json` (prepend crash; bump `updatedAt`) and mirror an `<item>` in `feed.xml`.
2. **Admin UI:** Open `admin.html` → fill form → download merged `crashes.json` → commit via PR.
3. **Crash Bot:** See [`api/README.md`](api/README.md) for schema and future `POST /api/crashes`.

## Environment notes

| Variable / secret | Where | Purpose |
|-------------------|--------|---------|
| Formspree form id | `index.html` form `action` | Email subscribe |
| `CRASH_BOT_API_KEY` | Future write API only | Auth for automated posts |
| GitHub PAT | Browser `localStorage` via admin (optional) | Prefill Contents API curl — **never commit** |

Static Pages hosting has **no server env**. Do not put tokens in the repo.

## Project layout

```
honolulu-crash-feed/
├── index.html          # Public feed
├── admin.html          # Add-crash helper
├── styles.css
├── app.js
├── feed.xml            # RSS 2.0
├── data/crashes.json   # Source of truth for the UI
├── api/README.md       # Schema + Crash Bot notes
├── README.md
└── .gitignore
```

## Disclaimer

This project aggregates public news and official releases. It is not an official City & County or HPD product. Verify details with linked sources. Call **911** in emergencies.

## License

Content links remain property of their publishers. Site code: use freely for this project unless you add a LICENSE file.
