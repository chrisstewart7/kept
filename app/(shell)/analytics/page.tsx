import type { Metadata } from "next";
import { AnalyticsView } from "./analytics-view";

export const metadata: Metadata = {
  title: "Analytics",
  description:
    "Fees claimed, the 80/20 split over time, subscriptions purchased, donations paid, and $PAYPIG burned.",
};

export default function AnalyticsPage() {
  return <AnalyticsView />;
}
