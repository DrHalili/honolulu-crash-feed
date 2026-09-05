# Crash Bot API (static site)

Honolulu Crash Feed is a **static** GitHub Pages site. There is **no live write endpoint** yet.

## How Crash Bot can add crashes (today)

### Option A — Edit `data/crashes.json` (recommended)

1. Open [`../data/crashes.json`](../data/crashes.json).
2. Prepend a new object to the `crashes` array (newest first).
3. Set top-level `updatedAt` to the current UTC ISO timestamp.
4. Commit / open a PR to `main`.
5. Update [`../feed.xml`](../feed.xml) with a matching `<item>` (or regenerate RSS in a future CI step).

### Option B — Admin UI download

1. Open [`../admin.html`](../admin.html) (via a local static server or Pages).
2. Fill the form → **Generate & download crashes.json**.
3. Replace `data/crashes.json` in the repo and push/PR.
4. Optionally paste a GitHub token into localStorage to copy a Contents API `curl` helper (never commit the token).

### Option C — Future HTTP endpoint (not implemented)

A future worker (Cloudflare Worker, GitHub App, or small backend) could accept:

```http
POST /api/crashes
Authorization: Bearer <CRASH_BOT_API_KEY>
Content-Type: application/json
```

Body: one crash object (schema below). The service would commit to `data/crashes.json` and refresh `feed.xml`.

Until that exists, treat **JSON file + PR** as the API.

---

## JSON schema

Top-level file:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `updatedAt` | string (ISO 8601 UTC) | yes | Last data update |
| `timezone` | string | yes | Display timezone, e.g. `Pacific/Honolulu` |
| `crashes` | array | yes | Crash objects, newest `publishedAt` first |

### Crash object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Stable slug, e.g. `2026-09-04-h1-waiawa-dump-truck` |
| `title` | string | yes | Short headline |
| `summary` | string | yes | Neutral factual summary |
| `location` | string | yes | Street / intersection + neighborhood |
| `area` | string | no | Short area label (McCully, Kaneohe, …) |
| `severity` | string | yes | One of: `fatal`, `serious`, `traffic` |
| `crashTime` | string | yes | Incident time, ISO 8601 UTC |
| `crashTimeHst` | string | yes | Human HST string for UI |
| `publishedAt` | string | yes | When the report was published, ISO UTC |
| `publishedAtHst` | string | yes | Human HST string for UI |
| `newsLinks` | array | no | `{ "label": string, "url": string }` |
| `instagramLinks` | array | no | `{ "label": string, "url": string, "note"?: string }` |
| `sources` | array | no | `{ "name": string, "credit": string }` |
| `tags` | string[] | no | Lowercase keywords |

### Example

```json
{
  "id": "2026-09-05-example-crash",
  "title": "Example serious crash in Kailua",
  "summary": "Public agencies reported a two-vehicle collision…",
  "location": "Kailua Road near Hamakua Drive, Kailua",
  "area": "Kailua",
  "severity": "serious",
  "crashTime": "2026-09-05T20:00:00Z",
  "crashTimeHst": "Sep 5, 2026 · 10:00 AM HST",
  "publishedAt": "2026-09-05T21:00:00Z",
  "publishedAtHst": "Sep 5, 2026 · 11:00 AM HST",
  "newsLinks": [
    {
      "label": "Hawaii News Now",
      "url": "https://www.hawaiinewsnow.com/example/"
    }
  ],
  "instagramLinks": [],
  "sources": [
    { "name": "Hawaii News Now", "credit": "HNN Staff" }
  ],
  "tags": ["kailua", "serious"]
}
```

## Timezone notes

- Store machine times in **UTC** (`crashTime`, `publishedAt`, `updatedAt`).
- Store display strings in **HST** (`Pacific/Honolulu`, UTC−10, no DST).
- RSS `<pubDate>` should be RFC 822 GMT matching `publishedAt`.

## Auth (future)

- Env: `CRASH_BOT_API_KEY` on the write service only — never in the static repo.
- Admin page may keep a token in `localStorage` (`hcf_api_key`) for curl helpers; do not commit secrets.
