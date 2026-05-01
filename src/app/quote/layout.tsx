import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IS_TEST_MODE, testBannerCopy } from "@/lib/test-mode";

export default function QuoteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {IS_TEST_MODE && (
        <div className="fixed top-0 left-0 right-0 z-[55] bg-amber-50 border-b border-amber-200 px-6 py-2 text-center pointer-events-none">
          <p className="text-[12px] font-bold text-amber-800 uppercase tracking-wider">
            {testBannerCopy}
          </p>
        </div>
      )}
      <main className="bg-[#f7f7f7] min-h-screen pt-[140px] pb-20">
        {children}
      </main>
      <Footer />
    </>
  );
}
