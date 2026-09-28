# Decisions

Each entry: **decision** → why → rejected alternative. API facts behind them are in
[`api-notes.md`](./api-notes.md).

## Product

### Top movers ranked by dollar contribution, not by percentage

→ The digest answers "what changed my wallet". A $5 token up 80% moved it by $4; $10,000 of ETH up 3%
moved it by $300. Ranking by `|contribution $|` puts the second one first, which is the one that matters.
The share bar is `|contribution| / Σ|contribution|` over every eligible position, so gains and losses
compete on the same scale.
→ Rejected: ranking by `%` (it surfaces dust), and share of the net change (meaningless when gains
and losses cancel out).

### The headline shows the balance change plus a Market / Net transfers breakdown

→ Zerion's `changes.absolute_1d` includes transfers. vitalik.eth read "+$313k (+27%)" on a day every
asset he holds went down, because a large token arrived. The breakdown line
(`Market −$24,514 · Net transfers +$337,905`) is the "why" part of the product.
→ Rejected: showing only the market change (it disagrees with the chart and the total), and showing
only the balance change (misleading).

### 7d movers from per-asset weekly price charts, top 5 holdings

→ The API has no 7-day change per position. `GET /fungibles/{id}/charts/week` returns `stats.first/last`,
which gives the percentage for one request per asset. We take the 5 largest priced holdings (one request
each at 1 RPS) and label the result as covering top holdings.
→ Rejected: hiding movers in 7d (half the product disappears), and showing 24h movers under a 7d label
(inconsistent with the shared switch).

### Dust and spam are hidden; the threshold is `MIN_POSITION_VALUE_USD = 1`

→ Zerion's `only_non_trash` still leaves thousands of unpriced airdrops on popular wallets (6,117
positions on vitalik.eth). Movers require a price history and a value ≥ $1. Activity hides incoming
transfers worth < $1 or with no price, and the response carries `hiddenDustCount`, so the UI can say
what it hid instead of pretending it doesn't exist.
→ Rejected: filtering on `fungible_info.flags.verified` (too strict, since real memecoins are unverified),
and showing everything (44 of vitalik.eth's 53 weekly transactions are $0.000002 airdrops).

## Data layer

### Server-side proxy with a throttle queue and a shared cache

→ The key never leaves the server: it's read from `ZERION_API_KEY` in `pages/api` handlers only, and a
`NEXT_PUBLIC_` name was explicitly rejected. The demo tier is 1 RPS / 300 per day, and throttled 429s
still consume the daily quota. So requests are queued FIFO at one per ~1.05 s instead of fired and
retried. A 429 is retried at most twice, waiting `max(RateLimit-Org-Second-Reset, 1 s × 2ⁿ)`. An
exhausted daily quota fails fast.
→ Rejected: calling Zerion from the browser (leaks the key), and relying on retries alone (burns quota).

### 5-minute response cache with in-flight de-duplication

→ `/summary` and `/movers` both need the 4 MB positions payload. The cache shares a single upstream call
between concurrent routes and keeps results for `ZERION_CACHE_TTL_SECONDS` (300). Failures are never
cached. `filter[min_mined_at]` is floored to 5 minutes so the transactions request is cacheable, and
the exact window is applied after the fetch. The chain list is cached for 24 h.
→ Rejected: TASK.md's 60 s TTL (a few page reloads during a demo would eat a noticeable part of the
daily budget).

### Every block fetches independently

→ Four routes, four queries. A slow or failing chart never blanks the headline. With 1 RPS the blocks
naturally resolve at different times (~6–8 s on a cold cache), so each block owns its own
loading / empty / error state.
→ Rejected: one aggregated `/digest` endpoint (a single error or the slowest call blocks everything).

### Zod at the boundary, per-item parsing for lists

→ All Zerion responses are parsed with Zod and mapped to our types in `shared/types`. Raw JSON never
leaves `shared/server/zerion`. List items are parsed one by one: a malformed position is skipped and
logged instead of failing the whole wallet.
→ Rejected: one strict schema for the whole list (one odd airdrop token would take the page down).

### Mock mode swaps the transport, not the routes

→ `USE_MOCKS=true` replaces only the HTTP transport, so fixtures travel through the same Zod schemas,
mappers, cache and business logic as real data. Fixtures are real responses recorded on 2026-09-28
(4 wallets: up / down / active / quiet), with timestamps shifted to "now" at read time.
`MOCK_LATENCY_MS` and `MOCK_FAIL=route:CODE` make loading and error states reproducible.
→ Rejected: hand-written domain-shaped fixtures (they'd drift from the real API and skip the parsing
code).

### `period` is `1d | 7d` on every route

→ One shared switch drives all four blocks, so one vocabulary is used everywhere. `/chart` also accepts
TASK.md's `day | week` as aliases.

## Stack and structure

### Next.js Pages Router, Feature-Sliced layout without `entities`

→ The house convention (the scryde-frontend standard) the reviewer asked for. `src/pages` holds only
Next routes. API handlers are one line each over `shared/server/route`. Layers are
`widgets / features / shared` with bare aliases (`shared/lib`, no `@/`). Domain types live in
`shared/types` and pure logic in `shared/lib/helpers`.
→ Rejected: the App Router from TASK.md (overridden by the user), and an `entities` layer (not used in
the house landing archetype).

### styled-components instead of Tailwind

→ The house standard: a sibling `ui/styled.ts` per slice, transient `$props`, `styled-tools`, and a theme
object for tokens. `@scryderu/ui` / `@scryderu/lib` are private and branded for another product, so the
theme and primitives are written locally.
→ Rejected: Tailwind from TASK.md (overridden by the user).

### No `aria-*` / `role` attributes

→ House rule chosen over TASK.md's `aria-live` / roles requirement. Semantics come from native elements
(`button`, `form`, `label`, `ul`, `time`), and every image keeps `alt`.

## Interface (Stage 3)

### visx + framer-motion for the chart, not Recharts

→ Switching 24h ↔ 7d morphs the existing line into the new one instead of redrawing it. Both series are
resampled to 120 evenly spaced points, so the SVG path always has the same structure and framer-motion can
interpolate `d` directly. The tooltip is our own HTML, driven by pointer events, so it works for mouse hover
and touch drag alike (`touch-action: pan-y` keeps vertical scrolling).
→ Rejected: Recharts (re-animates from scratch on data change, and its tooltip is harder to style).

### Old data stays on screen while the new period loads

→ Every query uses `placeholderData` that returns the previous result **only for the same address**: a period
switch keeps the old numbers dimmed to 55% until the new ones arrive, while a different wallet starts from
skeletons instead of showing someone else's numbers. The headline number tweens from old to new.
→ Rejected: TanStack's `keepPreviousData` as-is (it would briefly show the previous wallet's data).

### Query retries follow the error, not a blanket count

→ One retry for network, 5xx and timeout errors. None for an invalid address, a 429 or a bad API key: retrying
can't fix them, and with 300 requests a day retrying a 429 makes things worse. `refetchOnWindowFocus` is off
for the same reason.

### Chart timestamps are clamped to "now" on the server

→ Zerion's last point is the end of the current bucket (up to ~12 min ahead). Clamping in `getWalletChart`
keeps the component pure and the "Now" label honest.
