import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PRIVACY } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Kept processes, collects, and does not do.",
};

export default function PrivacyPage() {
  return <LegalPage doc={PRIVACY} />;
}
