import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreView } from "./explore-view";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Every token routing fees through PayPig, and every creator receiving them.",
};

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreView />
    </Suspense>
  );
}
