import type { Metadata } from "next";
import { CreatorView } from "./creator-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  return {
    title: `@${handle}`,
    description: `Subscriptions and donations sent to onlyfans.com/${handle} through Kept.`,
  };
}

export default async function CreatorPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return <CreatorView handle={handle} />;
}
