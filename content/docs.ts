export interface DocSection {
  slug: string;
  title: string;
  body: string; // markdown-lite: paragraphs, "- " lists, "1. " lists, ``` code
}

export const DOCS: DocSection[] = [
  {
    slug: "why-paypig",
    title: "Why PayPig",
    body: `We're rebuilding how creator fees work.

PayPig supports the people who need money the most: OnlyFans creators — banked against, frozen out, and judged for doing legal work millions pay for.

Deploy a token and send its fees to your favorite creator. Fees arrive first as a subscription — a real paying subscriber in her dashboard — then as donations with messages shilling YOUR coin. The creator never signs up: no wallet, no crypto, just subs and tips.

$PAYPIG is the flywheel. 20% of every claim buys and burns it, so volume anywhere in the ecosystem flows back to holders. Every step posts a public receipt.

Degens get a reason to trade. Creators get paid. Holders get the flywheel.`,
  },
  {
    slug: "overview",
    title: "Overview",
    body: `PayPig is a fee bridge. A token points its creator fees at us. We claim them on-chain. 80% is delivered to the named OnlyFans creator as real subscription purchases and donations. 20% buys $PAYPIG and burns it. The creator does not sign up.

Recipients never connect a wallet and never touch crypto. Deployers accept the terms by directing fees. Every payment is posted publicly and recorded on the Payments page with a receipt.`,
  },
  {
    slug: "supported-venues",
    title: "Supported venues",
    body: `- pump.fun on Solana — live
- Other launchpads — not supported

Support for additional venues will be announced on @PayPigApp before it ships.`,
  },
  {
    slug: "directing-fees",
    title: "Directing fees",
    body: `100%. Permanent. Treasury as sole shareholder. Revoke config authority on pump.fun.

Partial shares are not supported. If the share is later redirected away from the treasury, the token is delisted and pending balances settle under the held-balance rules.

\`\`\`
Treasury
PayPigTreasury11111111111111111111111111111
\`\`\``,
  },
  {
    slug: "naming-the-recipient",
    title: "Naming the recipient",
    body: `Required line in the token description:

\`\`\`
Fees to onlyfans.com/<username> via PayPig
\`\`\`

That one line is the entire pairing. The OnlyFans username must match ^[a-zA-Z0-9._-]+$ exactly as it appears in the creator's page URL. Both rails — subs and donations — deliver to that page; nothing else is needed from anyone.`,
  },
  {
    slug: "the-80-20-split",
    title: "The 80/20 split",
    body: `Applied per claim. No discretion.

- 80% is the creator share. It funds subscription purchases first, then donations.
- 20% is the protocol cut. It market-buys $PAYPIG and burns it.

$PAYPIG's own fees stay in the protocol treasury. The split is fixed — holding $PAYPIG does not change it, and neither does anything else.`,
  },
  {
    slug: "how-claims-work",
    title: "How claims work",
    body: `Scheduled, not per trade. The claim worker sweeps vaults on a cycle.

- Vaults under 0.01 SOL are skipped until they accrue more.
- Failed claims retry on the next cycle.
- Fees are not lost. They sit in the pump.fun vault until claimed.

Each claim is split 80/20 at the moment it lands, and each leg is visible on the Capital Flow page with its transaction.`,
  },
  {
    slug: "subscription-purchases",
    title: "Subscription purchases",
    body: `When a creator's unpaid 80% balance ≥ their OnlyFans monthly price (detected, or default $9.99):

1. The subscription worker funds a card float.
2. A protocol fan account subscribes to the creator for 30 days — the creator sees a new paying subscriber in their OnlyFans dashboard.
3. PayPig records the purchase and posts a public receipt.
4. Residual cents stay in the creator's balance toward the next sub or donation.

Token holders do not receive OnlyFans access. Account sharing is not part of the protocol.

If the worker cannot complete a purchase (card decline, account limitation, creator unavailable), the amount remains in balance and can settle as a donation.`,
  },
  {
    slug: "donations",
    title: "Donations",
    body: `Whatever is left after whole subscriptions is donated — tipped to the creator on OnlyFans from the same protocol fan account.

- Residual donations fire once the leftover reaches $5.
- The tip lands directly in the creator's OnlyFans earnings, same as any fan tip.
- The fan account must hold an active subscription to tip, so the first sub always precedes the first donation.

Donations post as receipts from @PayPigApp, tagged DONATION, with the amount and the creator's page.`,
  },
  {
    slug: "held-balances",
    title: "Held balances",
    body: `A balance goes to held when the delivery worker cannot settle it — a card decline, an account limitation, or a creator page that is paused or unavailable.

- Held balances wait 7 days while delivery retries.
- During the window the creator may claim directly by emailing admin@paypig.app.
- After the window, the balance routes to the protocol treasury / $PAYPIG buyback.

Held balances are listed on the Payments page under Held, per creator.`,
  },
  {
    slug: "public-confirmation",
    title: "Public confirmation",
    body: `@PayPigApp posts a receipt card for every SUB and DONATION event. The same record appears on the Payments page and at /receipt/[id].

Receipts carry the amount, the rail, the creator, the token, the claim signature, and the time. Anyone can verify the chain leg on Solscan.`,
  },
  {
    slug: "paypig-and-the-buyback",
    title: "$PAYPIG and the buyback",
    body: `20% of each claim. Market buy via Jupiter. SPL burn. Public Solscan link.

- No governance.
- No fee discount.
- No access rights.

$PAYPIG is the value-accrual token of the protocol and nothing else. Its float only shrinks when the launchpad does volume.`,
  },
  {
    slug: "stopping-payments",
    title: "Stopping payments",
    body: `A creator can stop payments at any time.

1. Email admin@paypig.app or message @PayPigApp from an account that can be verified against the OnlyFans page.
2. The request is honored within 7 days.
3. Existing held balances are paid out if requested.

Tokens pointing at a creator who opted out stop settling — their fee share routes to buyback until the deployer redirects or the token dies.`,
  },
  {
    slug: "token-not-registering",
    title: "Token not registering",
    body: `Checklist, in order:

1. Fee share is 100% to the treasury — partial shares are ignored.
2. Config authority is revoked.
3. The treasury address matches exactly.
4. The description contains the exact line: Fees to onlyfans.com/<username> via PayPig
5. Indexer delay — detection can lag a few minutes after the config lands.

If all five pass and the token still does not appear, contact admin@paypig.app with the mint.`,
  },
  {
    slug: "glossary",
    title: "Glossary",
    body: `- Creator fees — the fee stream pump.fun pays a coin's fee-share recipient.
- Fee sharing — pump.fun's config that directs those fees to an address.
- Claim — the on-chain sweep that moves accrued fees from the vault to the treasury.
- Recipient share — the 80% owed to the named creator.
- Protocol cut — the 20% that buys and burns $PAYPIG.
- Held balance — a recipient share that cannot settle yet.
- Float — pre-funded USD the delivery worker spends on subs and tips.
- Donation — the residual after whole subs, tipped to the creator on OnlyFans.
- Treasury — the protocol wallet that receives 100% of directed fees.
- Subscription worker — the service that purchases OnlyFans subscriptions from a protocol fan account.
- Card float — the funded card the subscription worker charges.
- Payout — a single SUB or DONATION event, always with a public receipt.
- Rail — the path a payout takes: SUB or DONATION.`,
  },
];

export function getDoc(slug: string): DocSection | undefined {
  return DOCS.find((d) => d.slug === slug);
}
