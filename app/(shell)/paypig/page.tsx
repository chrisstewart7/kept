import type { Metadata } from "next";
import { PayPigView } from "./paypig-view";

export const metadata: Metadata = {
  title: "$PAYPIG",
  description:
    "The value-accrual token of PayPig. 20% of every claimed fee buys $PAYPIG on the market and burns it.",
};

export default function PayPigPage() {
  return <PayPigView />;
}
