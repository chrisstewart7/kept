import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { DISCLOSURES } from "@/content/legal";

export const metadata: Metadata = {
  title: "Disclosures",
  description: "Risk disclosures for Kept and $KEPT.",
};

export default function DisclosuresPage() {
  return <LegalPage doc={DISCLOSURES} />;
}
