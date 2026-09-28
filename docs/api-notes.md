# Zerion API notes

Verified on 2026-09-28 against the docs at <https://developers.zerion.io/llms.txt> **and** live
requests with our key. Anything marked _(live)_ was observed in a real response, not just read
in the docs.

Base URL: `https://api.zerion.io/v1`. Responses follow JSON:API (`links`, `data{type,id,attributes,relationships}`).
IDs are opaque: never parse or construct them.

## Auth

HTTP Basic. The API key is the username and the password is empty:

```
Authorization: Basic base64("<ZERION_API_KEY>:")
accept: application/json
```

Confirmed _(live)_. The key is only ever read on the server (`process.env.ZERION_API_KEY`).
It must **not** use a `NEXT_PUBLIC_` prefix, because Next.js inlines those into the client bundle.

The API sits behind Cloudflare, which **rejects some default user agents** with `403 Error 1010`
_(live: Python `urllib` was blocked, while curl and Node `fetch` got through)_. The server client always
sends `User-Agent: since-yesterday/0.1`.

## Rate limits: stricter than planned

|            | Planned (TASK.md) | Actual key _(live)_                      |
| ---------- | ----------------- | ---------------------------------------- |
| Tier       | free              | `ratelimit-org-tier: demo`               |
| Per second | 2                 | **1** (`ratelimit-org-second-limit: 1`)  |
| Per day    | ~3000             | **300** (`ratelimit-org-day-limit: 300`) |

Headers on every response: `RateLimit-Org-{Second,Day,Month}-{Limit,Remaining,Reset}` (reset in seconds),
`RateLimit-Org-Tier`.

429 body _(live, 2 of 4 parallel requests)_:

```json
{ "errors": [{ "title": "Too many requests", "detail": "Your request had been throttled" }] }
```

- There is **no `Retry-After`** on 429. Wait `RateLimit-Org-Second-Reset` seconds (1 s) instead.
- **Throttled requests still count against the daily quota** _(live: remaining dropped 287 → 285 on a
  burst with two 429s)_. Queueing correctly is therefore cheaper than retrying.
- When `RateLimit-Org-Day-Remaining` is 0, retrying is pointless. Surface a rate-limit error immediately.

Consequences for the server client:

- Throttle queue at **1 request / second**, not 2.
- In-flight de-duplication plus a response cache, so `summary` and `movers` share one `positions` call.
- A 60 s cache is too short for a 300/day budget during a demo. Agreed: **5 min TTL** (`ZERION_CACHE_TTL_SECONDS`).

## Errors

```json
{
  "errors": [
    {
      "title": "Malformed parameter was sent",
      "detail": "wallet address 0xnotanaddress must be a valid EVM or Solana address"
    }
  ]
}
```

_(live, HTTP 400)_

| Status | Meaning                                                            | Retry?                                  |
| ------ | ------------------------------------------------------------------ | --------------------------------------- |
| 400    | Malformed parameter (e.g. invalid address)                         | no                                      |
| 401    | Missing / invalid key                                              | no                                      |
| 404    | Resource not found (single-resource endpoints)                     | no                                      |
| 422    | Cannot be served (e.g. wallet with > 1M actions)                   | no                                      |
| 429    | Throttled                                                          | yes, after `RateLimit-Org-Second-Reset` |
| 500    | Zerion-side error                                                  | yes, backoff                            |
| 503    | Data still being prepared (fresh wallet), comes with `Retry-After` | yes, honour `Retry-After`               |

## Endpoints we use

### Portfolio: `GET /wallets/{address}/portfolio`

Params: `currency=usd`, `filter[positions]=only_simple|only_complex|no_filter` (default `only_simple`).

```jsonc
"attributes": {
  "positions_distribution_by_type": { "wallet": 1459429.55, "deposited": 0, "borrowed": 0, "locked": 0.05, "staked": 0 },
  "positions_distribution_by_chain": { "ethereum": 1367086.16, "base": 16301.12, ... },
  "total":   { "positions": 1459429.60 },
  "changes": { "absolute_1d": 313390.87, "percent_1d": 27.35 }
}
```

- **Only a 1-day change.** No 7d field.
- ⚠️ `changes.absolute_1d` is the **balance** change and **includes transfers in and out**, not just
  price movement. _(live, vitalik.eth)_: portfolio `absolute_1d = +$313k (+27%)`, while the sum of
  `absolute_1d` over all positions is **−$24.5k**. The difference is a ~$326k token received that day.
  It matches the day chart (first point $1.145M → last point $1.457M). See Decision 1.

### Fungible positions: `GET /wallets/{address}/positions/`

Params: `currency=usd`, `filter[positions]=only_simple`, `filter[trash]=only_non_trash` (default),
`filter[position_types]`, `filter[chain_ids]`, `sort=value|-value`. **Not paginated.**

```jsonc
{
  "type": "positions", "id": "…opaque…",
  "attributes": {
    "position_type": "wallet",            // deposit | loan | locked | staked | reward | wallet | investment
    "quantity": { "int": "…", "decimals": 18, "float": 63245.55, "numeric": "63245.55…" },
    "value": 15321.4,                     // nullable
    "price": 2671.1,
    "changes": { "absolute_1d": -87.31, "percent_1d": -0.567 },   // nullable as a whole object
    "fungible_info": { "name": "Ethereum", "symbol": "ETH", "icon": { "url": "…" } | null,
                       "flags": { "verified": true }, "implementations": [{ "chain_id", "address", "decimals" }] },
    "flags": { "displayable": true, "is_trash": false }
  },
  "relationships": {
    "chain":    { "data": { "type": "chains",    "id": "ethereum" } },
    "fungible": { "data": { "type": "fungibles", "id": "eth" } }
  }
}
```

Observed _(live, vitalik.eth)_:

- **6,117 positions, 14.7 MB response** even with `only_non_trash`. Payloads like this must never reach
  the browser. The server reduces them to the few rows we need.
- `changes: null` on 4,984 positions and `value: null` on 4,977, i.e. tokens without a price feed.
  Only 334 positions are worth ≥ $1.
- `fungible_info.icon` is null for 4,937, so the letter-avatar fallback is essential.
- **`sort=-value` came back ascending** (the largest value was last). Sort on our side and don't rely on it.
- **No 7d change on positions.** See Decision 2.
- The fungible ID for native ETH is literally `eth`. Other IDs are UUIDs or contract addresses (opaque).

### Wallet balance chart: `GET /wallets/{address}/charts/{period}`

`period ∈ hour | day | week | month | 3months | 6months | year | 5years | max`. Params: `currency`,
`filter[chain_ids]`, `filter[fungible_ids]`, `filter[exclude_fungible_ids]`, `filter[positions]`.

```jsonc
"attributes": { "begin_at": "2026-09-27T14:40:00Z", "end_at": "2026-09-28T14:40:00Z",
                "points": [[1790520000, 1145231.33], …] }      // [unix seconds, value]
```

_(live)_: `day` has 289 points (5 min step), `week` has 337 points (30 min step). Works for Solana.
The last point is the **end of the current bucket**, so it can sit a few minutes in the future
(+1.5 min for `day`, +12 min for `week` when captured). The chart clamps it to "now".

### Fungible chart (for 7d movers): `GET /fungibles/{fungible_id}/charts/{period}`

```jsonc
"attributes": { "begin_at", "end_at", "points": [[1790002800, 2736.12], …],
                "stats": { "first": 2736.12, "min": 2637.69, "avg": 2701.77, "max": 2803.68, "last": 2671.12 } }
```

_(live, `eth`, `week`)_: `stats.first` / `stats.last` give the 7d price change directly:
`pct7d = (last / first − 1) × 100`.

### Transactions: `GET /wallets/{address}/transactions/`

Params: `currency`, `page[size]` (1–100, default 100), `page[after]` (use `links.next`),
`filter[min_mined_at]` / `filter[max_mined_at]` (**milliseconds**, 13 digits), `filter[operation_types]`,
`filter[asset_types]=fungible,nft`, `filter[chain_ids]`, `filter[trash]` (**default `no_filter`**, so we
send `only_non_trash`).

`operation_type` enum (complete):

```
approve, bid, burn, claim, delegate, deploy, deposit, execute, mint,
receive, revoke, revoke_delegation, send, trade, withdraw
```

There is **no `swap`, `bridge` or `stake`**. A swap is `trade`. Staking and lending show up as `deposit` /
`withdraw`. A bridge has no dedicated type: it is a `send`/`trade`/`execute` on the source chain via a
bridge dapp.

```jsonc
"attributes": {
  "operation_type": "trade", "hash": "0x…", "mined_at": "2026-09-16T19:51:51Z", "mined_at_block": 1,
  "status": "confirmed",                           // confirmed | failed | pending
  "sent_from": "0x…", "sent_to": "0x…", "nonce": 1, "address": "0x…",
  "flags": { "is_trash": false },
  "fee": { "fungible_info", "quantity": { "float", "numeric" }, "price", "value" },
  "transfers": [{ "direction": "in" | "out" | "self", "fungible_info": {…}, "nft_info"?: {…},
                  "quantity": { "int", "decimals", "float", "numeric" }, "value": 1.0, "price": 1.0,
                  "sender": "0x…", "recipient": "0x…", "act_id": "0" }],
  "approvals": [{ "fungible_info", "quantity", "sender", "act_id" }],
  "application_metadata": { "name": "ENS", "icon": { "url" }, "contract_address", "method": { "id", "name" } },  // optional
  "acts": [{ "id": "0", "type": "trade", "application_metadata": {…} }]
},
"relationships": { "chain": { "data": { "id": "ethereum" } }, "dapp"?: { "data": { "id": "ens" } } }
```

Observed _(live)_:

- `application_metadata` is missing on plain transfers and present on dapp calls (`execute` via ENS).
  `name` can be absent even when the object exists. `method.name` is often `""`.
- A `trade` can contain `self` transfers and an approval alongside the `in`/`out` pair. Take
  `out` as the "from" side and `in` as the "to" side, and ignore `self`.
- Approval quantity can be `1.157e59` (unlimited). Render it as "unlimited", not as a number.
- `value` and `price` on a transfer are nullable (tokens without a price).
- vitalik.eth over 7 days: 53 non-trash txs, of which 44 are `receive` of dust airdrops (`$0.000002`).

#### Sentence mapping (Stage 2)

| `operation_type`                                 | Sentence                                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `trade`                                          | `Swapped 0.5 ETH → 1,200 USDC on Uniswap` (out → in; ` on <dapp>` only if known) |
| `send`                                           | `Sent 100 USDC to 0x12ab…89cd` (`to <dapp>` when there's a bridge/dapp name)     |
| `receive`                                        | `Received 0.2 ETH from 0x12ab…89cd`                                              |
| `deposit`                                        | `Deposited 1 ETH into Lido`                                                      |
| `withdraw`                                       | `Withdrew 1 ETH from Aave`                                                       |
| `claim`                                          | `Claimed 12 ARB from Arbitrum`                                                   |
| `approve`                                        | `Approved USDC for Uniswap` (`unlimited` above 1e30)                             |
| `revoke`                                         | `Revoked USDC approval for Uniswap`                                              |
| `mint` / `burn`                                  | `Minted …` / `Burned …`                                                          |
| `bid`, `delegate`, `revoke_delegation`, `deploy` | Simple verb + asset/dapp                                                         |
| `execute`                                        | `Interacted with ENS` / `Contract interaction`                                   |
| anything else / empty                            | `Transaction on <Chain>` (neutral fallback)                                      |
| `status: failed`                                 | Prefix `Failed:` with muted styling                                              |

### Chains: `GET /chains/{chain_id}`

Returns `name`, `icon.url`, `explorer`, `external_id`. Needed for the network name and icon. The list is
static, so cache it for 24 h (or hard-code the ~10 most common names and fall back to the id).

## Spam / junk filtering

- Positions: `filter[trash]=only_non_trash` (the default). Classification is per asset.
- Transactions: `filter[trash]=only_non_trash` must be sent explicitly. Classification depends on the
  wallet context.
- **It isn't enough on its own** _(live)_: vitalik.eth still has 6k non-trash positions, mostly unpriced
  airdrops. Our own filter for movers: `!is_trash && value >= $1 (MIN_POSITION_VALUE_USD) && changes != null`.
- `fungible_info.flags.verified` is too strict to filter on (ETH-side memecoins with real markets are
  unverified). Show it at most as a hint.

## Solana

Same endpoints, same shapes _(live, `5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9`)_: `portfolio`, `charts/day`
and `transactions` all return 200. Address pattern: `^[1-9A-HJ-NP-Za-km-z]{32,44}$` (base58).
Limitation from the docs: protocol (DeFi) positions aren't supported for Solana yet. This doesn't matter
for us, since we only use `only_simple`.
→ Address validation accepts both EVM and Solana.

## Gaps and decisions

### Decision 1: the headline has to explain the "why" (agreed)

`portfolio.changes.absolute_1d` mixes market movement with transfers. On vitalik.eth the headline would
read "up $313k (+27%)" while every asset he holds actually went **down**, which is exactly the kind of
misleading summary this product exists to avoid.

Proposal: keep the headline as the balance change (it agrees with the chart), and add a one-line
breakdown under it:

> **Your wallet is up $313,391 (+27.3%) since yesterday**
> Market −$24,514 · Net transfers +$337,905

- Market (24h) = Σ `positions[].changes.absolute_1d` (priced, non-trash).
- Net transfers = balance change − market.
- In 7d: balance change = last − first `charts/week` point. Market = Σ per-asset 7d contribution
  (Decision 2) over the positions we priced.

### Decision 2: 7d movers via per-asset week charts (agreed)

No 7d change exists on positions, portfolio or `fungibles.market_data.changes` (`percent_1d/30d/90d/365d` only).
For the top **N** priced positions by value, call `GET /fungibles/{id}/charts/week` and compute
`contribution = value_now − value_now / (1 + pct7d / 100)`.

Cost at the demo tier: N extra requests, ~N seconds at 1 RPS. We cap N at **5** (the movers list size)
instead of 8. Ranking by value first means a small position could in theory outrank a large one on
contribution. That's acceptable, and it's noted in the UI ("Top holdings, 7d").

### Request budget per wallet view (demo tier)

| Action                  | Upstream requests                                                 |
| ----------------------- | ----------------------------------------------------------------- |
| Open wallet, 24h        | portfolio + positions + chains + chart/day + transactions = **5** |
| Switch to 7d            | chart/week + transactions(7d) + 5 fungible charts = **7**         |
| Reload within cache TTL | 0                                                                 |

About 12 requests per fully explored wallet → roughly 25 wallets a day. Mock mode (`USE_MOCKS=true`)
is the default for development, and real mode is reserved for demos.

_(live, Justin Sun's wallet, cold cache)_: the four routes requested in parallel all resolved in **~7.7 s**
(5 upstream calls at 1 RPS plus a 4 MB positions payload). The chart came first at 5.9 s. A repeat
request is answered from cache in 3 ms. Per-block skeletons that resolve independently are therefore
essential, not decoration.

### Decision 3: example wallets and fixtures

vitalik.eth is a poor showcase (mostly dust airdrops, and a balance swing driven by transfers). Fixtures
were recorded on 2026-09-28 from four public wallets:

| Fixture  | Address                                      | 24h                     | Why                                                        |
| -------- | -------------------------------------------- | ----------------------- | ---------------------------------------------------------- |
| `up`     | `0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296` | +$57k (+2.2%)           | One clear mover (SPX +$63k)                                |
| `down`   | `0x176F3DAb24a159341c0509bB36B833E7fdd0a132` | −$9.6M (−0.5%)          | stETH/WBTC drawdown, large numbers for compact formatting  |
| `active` | `0x020cA66C30beC2c4Fe3861a94E4DB4A498A35872` | −$67                    | 40 txs in 7d: trade, approve, burn, execute, send, receive |
| `quiet`  | `0x983110309620D911731Ac0932219af06091b6744` | $0 (derived, see below) | No transactions in 7d                                      |

The `quiet` fixture is **derived**: its real responses have price changes zeroed, flat charts, and fungible ids
prefixed `quiet-` so they don't collide with the other fixtures' price history. Everything else is real JSON,
with positions trimmed to the 40 largest priced ones plus a few unpriced and dust rows to exercise the filters.
In mock mode timestamps are shifted so the capture moment becomes "now". Unknown addresses map to a
fixture deterministically.
