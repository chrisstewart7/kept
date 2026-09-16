import type { Metadata } from "next";
import { FlowView } from "./flow-view";

export const metadata: Metadata = {
  title: "Capital Flow",
  description:
    "One claim, walked all the way through: claim → split → sub or donation → burn.",
};

export default function FlowPage() {
  return <FlowView />;
}
