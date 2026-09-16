import type { Metadata } from "next";
import { HomeView } from "./home-view";

export const metadata: Metadata = {
  title: "Kept — Route token fees into subs and donations",
  description:
    "Point a token's creator fees at any OnlyFans creator. Kept turns those fees into real subscriptions and donations, delivered straight to the creator.",
};

export default function HomePage() {
  return <HomeView />;
}
