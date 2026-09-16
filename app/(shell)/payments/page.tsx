import type { Metadata } from "next";
import { PaymentsView } from "./payments-view";

export const metadata: Metadata = {
  title: "Payments",
  description:
    "Every subscription purchase and donation Kept has made, with public receipts.",
};

export default function PaymentsPage() {
  return <PaymentsView />;
}
