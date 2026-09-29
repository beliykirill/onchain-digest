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

### Unverified price spikes are reported apart from the market

→ On 2026-09-29 vitalik.eth read "+$966k (+85%)": an airdropped, unverified token (ZC) went up 4,637% and
became a $634k holding. That is a thin or manipulated market, not money the user can realise. An unverified
token up ≥ `SUSPICIOUS_CHANGE_PERCENT` (500%) over the period, or one whose price started at $0, is left out of
the movers and the Market figure. The headline keeps the full change so it still agrees with the chart, and the
breakdown gains an _Unverified spikes_ part. The movers card names what it hid. A weekly chart that starts at $0
counts the whole current value as the change instead of dropping it, which used to push these spikes into
Net transfers.
→ Rejected: hiding unverified tokens entirely (real memecoins are unverified too), and removing the spike from
the headline total (it would disagree with the balance chart).

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
→ Rejected: a 60 s TTL (a few page reloads during a demo would eat a noticeable part of the daily
budget).

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

### Real data only, no mock mode

→ The app always talks to Zerion. A fixture mode (`USE_MOCKS`) existed during development and was removed on
2026-09-29: the deployed page must show real wallets, and a second data path is one more thing to keep in sync
with the API.
→ Rejected: keeping recorded fixtures as a fallback (a demo that silently shows yesterday's numbers is worse
than an honest error state).

### Client error messages are generic, details stay in the server log

→ The browser only gets a neutral message per error code ("Wallet data is temporarily unavailable. Try again
later."). What actually went wrong (a missing `ZERION_API_KEY`, a rejected key, an exhausted daily quota) goes
into `AppError.detail`, which the route logs and never serialises.
→ Rejected: forwarding the upstream or configuration message (it leaks setup details to every visitor).

### `period` is `1d | 7d` on every route

→ One shared switch drives all four blocks, so one vocabulary is used everywhere. Every route also
accepts `day | week` as aliases.

## Stack and structure

### Next.js Pages Router, Feature-Sliced layout without `entities`

→ This is the stack and layout I use in production, so the code reads the way my day-to-day code does.
`src/pages` holds only Next routes. API handlers are one line each over `shared/server/route`. Layers are
`widgets / features / shared` with bare aliases (`shared/lib`, no `@/`). Domain types live in
`shared/types` and pure logic in `shared/lib/helpers`.
→ Rejected: the App Router (nothing on this page needs server components, and the Pages Router keeps
data fetching explicit), and an `entities` layer (a single page has no domain entities shared between
features).

### styled-components instead of Tailwind

→ A sibling `ui/styled.ts` per slice, transient `$props` and `styled-tools`. Color tokens are CSS
variables read through `color()` from `shared/lib/themes`, so there is no `ThemeProvider` and switching
the theme never re-renders React. `shared/ui` components are flat folders (`<name>/{index.tsx, styled.ts}`).
The tokens and text primitives are written for this project, with no UI kit.
→ Rejected: Tailwind (long class strings make the per-state styles of the chart and the segmented control
harder to read than a named styled component).

### No `aria-*` / `role` attributes

→ Semantics come from native elements (`button`, `form`, `label`, `ul`, `time`), and every image keeps
`alt`.

## Interface

### visx + framer-motion for the chart, not Recharts

→ Switching 24h ↔ 7d morphs the existing line into the new one instead of redrawing it. Both series are
resampled to 120 evenly spaced points, so the SVG path always has the same structure and framer-motion can
interpolate `d` directly. The tooltip is our own HTML, driven by pointer events, so it works for mouse hover
and touch drag alike (`touch-action: pan-y` keeps vertical scrolling).
→ Rejected: Recharts (re-animates from scratch on data change, and its tooltip is harder to style).

### Old data stays on screen while the new period loads

→ Every query uses `placeholderData` that returns the previous result **only for the same address**: a period
switch keeps the old numbers dimmed until the new ones arrive, while a different wallet starts from
skeletons instead of showing someone else's numbers. The headline number tweens from old to new.
→ Rejected: TanStack's `keepPreviousData` as-is (it would briefly show the previous wallet's data).

### Query retries follow the error, not a blanket count

→ One retry for network, 5xx and timeout errors. None for an invalid address, a 429 or a bad API key: retrying
can't fix them, and with 300 requests a day retrying a 429 makes things worse. `refetchOnWindowFocus` is off
for the same reason.

### Chart timestamps are clamped to "now" on the server

→ Zerion's last point is the end of the current bucket (up to ~12 min ahead). Clamping in `getWalletChart`
keeps the component pure and the "Now" label honest.

## Polish

### Theme: system by default, manual override without a flash

→ Colors are CSS variables switched by `prefers-color-scheme` and by `data-theme` on `<html>`. A tiny inline
script in `_document` applies the saved choice before first paint, and the toggle's sun/moon swap is pure CSS,
so the server never needs to know the theme and there is no hydration mismatch.
→ Rejected: a theme in React state or context (flashes the wrong theme on load).

### A shimmering page glow behind a floating glass header

→ A fixed layer behind the content: a blurred conic ring in the positive / accent / negative colors rotates
slowly and a second spot breathes on top, so the colors keep flowing into each other. Only `transform` and
`opacity` animate, and the global reduced-motion rule freezes it. The header is a glass panel the width of the
content, so the glow shows through it instead of ending at an opaque bar.
→ Rejected: a glow on the start screen only (the digest looked flat next to it), and a full-width opaque
header (it cut the glow off).

### The chart is operable from the keyboard

→ The plot is focusable: focus shows the latest point, ←/→ scrub through time, Home/End jump to the ends. It
reuses the pointer tooltip, so there is one code path for mouse, touch and keyboard.

### Measured, not assumed

→ Lighthouse, measured on 2026-09-28 on a production build, before the page glow and the glass header were
added (re-run it before quoting these numbers): Performance 100 / Accessibility 100 / Best Practices 100 / SEO 100
on desktop, and 94–96 / 100 / 100 / 100 on mobile with throttling. CLS is 0 on desktop and 0.015 on mobile. All
controls are at least 44 px tall. Text and background pairs are at least 4.5:1 in both themes.
