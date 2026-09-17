import type { Metadata } from "next";
import { LaunchView } from "./launch-view";

export const metadata: Metadata = {
  title: "Launch",
  description:
    "Launch a pump.fun token that routes 100% of creator fees through PayPig, or register one that already does.",
};

export default function LaunchPage() {
  return <LaunchView />;
}
