import type { Metadata } from "next";
import { KeptView } from "./kept-view";

export const metadata: Metadata = {
  title: "$KEPT",
  description:
    "The value-accrual token of Kept. 20% of every claimed fee buys $KEPT on the market and burns it.",
};

export default function KeptPage() {
  return <KeptView />;
}
