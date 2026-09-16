# Kept

Route token fees into real OnlyFans subscriptions and donations.

Next.js 15 (App Router) + TypeScript + Tailwind v4. The full product spec lives
in the build prompt; this repo implements every route in §4 with a coherent,
time-evolving mock API under `app/api/*` (seeded — the same universe every
boot, with new payouts appearing as wall-clock time passes).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

## Preview ledger vs zero state

No real launches have settled yet, so the site runs a seeded **preview
ledger** by default — labeled "Preview" in the ticker — so the chrome never
shows blank pages: live-evolving payouts, burns, tokens, and charts. Tokens
registered through `/launch` appear alongside it immediately, and real claim
data replaces the preview when the backend lands. Set `DEMO_DATA=0` for the
honest all-zero state (empty states + "Example"-labeled worked claim).

## Swap mocks for real backends

- `lib/data.ts` is the only mock. Every API route is a thin wrapper over its
  exported query functions — replace their bodies with real reads and the UI
  does not change.
- All money is integer USD cents in the data layer, formatted at the edge
  (`lib/format.ts`).
- Wallets: `components/wallet.tsx` talks to the injected provider standard
  (Phantom / Solflare / Backpack) directly. Swap for
  `@solana/wallet-adapter-react` when the real Pump create integration lands
  (`@solana/web3.js` is already installed).
- Placeholders: `$KEPT` mint and treasury in `lib/constants.ts` / `.env`.

## Notes

- Launch → "Launch on Pump" simulates the four-step checklist (§10) and
  registers the token in the in-memory universe so Explore updates.
- `/receipt/[id]` is public and printable, with no app chrome.
- Docs (§8) and legal (§9) copy are typed content in `content/`.
