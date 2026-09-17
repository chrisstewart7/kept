import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { TERMS } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms a deployer accepts by directing fees to PayPig.",
};

export default function TermsPage() {
  return <LegalPage doc={TERMS} />;
}
