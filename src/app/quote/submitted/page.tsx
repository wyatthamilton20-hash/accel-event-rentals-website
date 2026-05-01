import type { Metadata } from "next";
import { Suspense } from "react";
import { SubmittedPanel } from "./SubmittedPanel";

export const metadata: Metadata = {
  title: "Quote received",
  description: "Thanks — we received your event rental request.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function QuoteSubmittedPage() {
  return (
    <Suspense fallback={null}>
      <SubmittedPanel />
    </Suspense>
  );
}
