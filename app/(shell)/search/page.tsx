import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPageView } from "./search-view";

export const metadata: Metadata = {
  title: "Search",
  description: "Search tokens, creators, mints, and OF usernames.",
};

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageView />
    </Suspense>
  );
}
