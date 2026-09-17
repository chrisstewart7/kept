export interface LegalDoc {
  slug: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}

export const TERMS: LegalDoc = {
  slug: "terms",
  title: "Terms of Service",
  updated: "September 16, 2026",
  sections: [
    {
      heading: "Acceptance",
      body: "The deployer of a token accepts these terms by directing the token's creator fees to the PayPig treasury. No signature or account is required. If you do not accept these terms, do not direct fees.",
    },
    {
      heading: "Recipients",
      body: "The named recipient is not a party to these terms. A payment from PayPig is not an endorsement by the recipient and creates no contract between the recipient and PayPig, the deployer, or any token holder.",
    },
    {
      heading: "The split",
      body: "80% of each claimed fee is allocated to the named recipient. 20% purchases $PAYPIG on the open market and burns it. The split is fixed and applies per claim without discretion.",
    },
    {
      heading: "Prohibited use",
      body: "Prohibited: use by sanctioned persons or in sanctioned jurisdictions; fraud; impersonation; claiming or implying the named creator launched or endorsed a token; sharing of OnlyFans account credentials; underage sexual content — zero tolerance: tokens pointing at minors are rejected and reported to the relevant authorities.",
    },
    {
      heading: "No affiliation",
      body: "PayPig is not affiliated with OnlyFans, Fenix International Limited, X Corp., or Pump.fun. OnlyFans is a trademark of its owner and is used only to describe a destination platform.",
    },
    {
      heading: "Service, liability",
      body: "The service is provided as-is, without warranty of any kind. To the maximum extent permitted by law, PayPig's aggregate liability is capped at the protocol cut retained in the twelve months preceding the claim.",
    },
    {
      heading: "Opt-out",
      body: "A named creator may refuse further payments by contacting admin@paypig.app or @PayPigApp. Requests are honored within 7 days. Held balances are paid out on request.",
    },
  ],
};

export const PRIVACY: LegalDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  updated: "September 16, 2026",
  sections: [
    {
      heading: "What we process",
      body: "Public on-chain data (mints, signatures, balances) and public OnlyFans usernames as they appear in token descriptions. This data is already public; PayPig indexes it.",
    },
    {
      heading: "What we collect",
      body: "Wallet addresses are collected only when a deployer connects a wallet to launch. Email is collected only if you write to admin@paypig.app.",
    },
    {
      heading: "What we do not do",
      body: "We do not sell personal data. We do not run third-party advertising trackers. We do not collect payment card data from visitors — floats are protocol-operated.",
    },
    {
      heading: "Public profile cache",
      body: "Public OnlyFans avatars and display names are cached solely to identify a payment recipient on the Board. Paywalled content is never requested, collected, or stored. Recipients may opt out at any time via admin@paypig.app; opt-outs hide the avatar immediately and freeze new registrations for the username.",
    },
    {
      heading: "Retention",
      body: "On-chain records are permanent by nature. Off-chain operational records (payout queues, receipts) are retained as long as the protocol operates.",
    },
  ],
};

export const DISCLOSURES: LegalDoc = {
  slug: "disclosures",
  title: "Disclosures",
  updated: "September 16, 2026",
  sections: [
    {
      heading: "$PAYPIG",
      body: "$PAYPIG is not equity, a security offering, or a claim on revenue. It has no governance rights. Its only mechanism is the published buyback and burn.",
    },
    {
      heading: "Execution risk",
      body: "Subscription purchases may fail: card declines, platform limitations, or creator unavailability. Failed purchases settle under the donation and held-balance rules. Card and platform risk sits with the subscription worker, not the creator.",
    },
    {
      heading: "Unsolicited payments",
      body: "Recipients did not ask for these payments and may refuse them. A refused recipient's future share routes to buyback under the published rules.",
    },
    {
      heading: "No projections",
      body: "Past payouts are not a projection of future payouts. Fee flow depends entirely on token trading volume, which can go to zero.",
    },
  ],
};

export function getLegal(slug: string): LegalDoc | undefined {
  return [TERMS, PRIVACY, DISCLOSURES].find((d) => d.slug === slug);
}
