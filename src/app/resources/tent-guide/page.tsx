import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Tent Resource Guide | Accel Event Rentals",
  description:
    "Pick the right tent for your Oahu event: sizing by guest count and event style, frame vs. pole vs. sailcloth, and what to plan for site, permits, power, and weather.",
};

interface SizingRow {
  guests: number;
  theaterSqft: number;
  theaterSpace: string;
  cocktailSqft: number;
  cocktailSpace: string;
  banquetSqft: number;
  banquetSpace: string;
}

const SIZING: SizingRow[] = [
  { guests: 20,  theaterSqft: 200,  theaterSpace: "10×20", cocktailSqft: 225,  cocktailSpace: "15×15", banquetSqft: 400,  banquetSpace: "20×20" },
  { guests: 40,  theaterSqft: 400,  theaterSpace: "20×20", cocktailSqft: 600,  cocktailSpace: "20×30", banquetSqft: 800,  banquetSpace: "20×40" },
  { guests: 60,  theaterSqft: 600,  theaterSpace: "20×30", cocktailSqft: 900,  cocktailSpace: "30×30", banquetSqft: 1200, banquetSpace: "30×40" },
  { guests: 80,  theaterSqft: 800,  theaterSpace: "20×40", cocktailSqft: 1200, cocktailSpace: "30×40", banquetSqft: 1600, banquetSpace: "40×40" },
  { guests: 100, theaterSqft: 1000, theaterSpace: "20×50", cocktailSqft: 1500, cocktailSpace: "30×50", banquetSqft: 2000, banquetSpace: "40×50" },
  { guests: 120, theaterSqft: 1200, theaterSpace: "20×60", cocktailSqft: 1800, cocktailSpace: "30×60", banquetSqft: 2400, banquetSpace: "40×60" },
  { guests: 140, theaterSqft: 1400, theaterSpace: "30×50", cocktailSqft: 2100, cocktailSpace: "30×70", banquetSqft: 2800, banquetSpace: "40×70" },
  { guests: 160, theaterSqft: 1600, theaterSpace: "40×40", cocktailSqft: 2400, cocktailSpace: "40×60", banquetSqft: 3200, banquetSpace: "40×80" },
  { guests: 180, theaterSqft: 1800, theaterSpace: "30×60", cocktailSqft: 2700, cocktailSpace: "30×90", banquetSqft: 3600, banquetSpace: "40×90" },
  { guests: 200, theaterSqft: 2000, theaterSpace: "40×50", cocktailSqft: 2800, cocktailSpace: "40×70", banquetSqft: 4000, banquetSpace: "40×100" },
  { guests: 220, theaterSqft: 2100, theaterSpace: "30×70", cocktailSqft: 3300, cocktailSpace: "40×80", banquetSqft: 4400, banquetSpace: "40×110" },
  { guests: 240, theaterSqft: 2400, theaterSpace: "40×60", cocktailSqft: 3600, cocktailSpace: "40×90", banquetSqft: 4800, banquetSpace: "40×120" },
];

export default function TentGuidePage() {
  return (
    <>
      <Header />
      <main className="bg-[#f7f7f7] pt-[140px] pb-20" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <section className="max-w-[900px] mx-auto px-6 sm:px-8 text-center py-10 sm:py-16">
          <p className="text-[12px] font-bold uppercase tracking-[0.25em] text-[#999]">
            <Link href="/resources" className="hover:text-[#ff6c0e] transition-colors">Resources</Link>
            <span className="mx-2 text-[#ccc]">/</span>
            <span className="text-[#ff6c0e]">Tent Guide</span>
          </p>
          <h1 className="mt-4 text-[#111] font-bold leading-[1.05]" style={{ fontSize: "clamp(36px, 6vw, 72px)" }}>
            Pick the right tent<span style={{ color: "#ff6c0e" }}>.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-[16px] leading-[1.7] text-[#555]">
            A quick reference for sizing and what to plan for. When you&apos;re ready to walk through your specific site, our team can spec the tent for you.
          </p>
        </section>

        <section className="max-w-[900px] mx-auto px-4 sm:px-8 space-y-12">
          <article className="rounded-2xl border border-[#e5e5e5] bg-white p-6 sm:p-10">
            <h2 className="text-[#111] font-bold text-[24px] sm:text-[28px]">Sizing reference</h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-[#555]">
              Pick your guest count on the left, then pick the event style. The row tells you the square footage and a typical tent dimension that fits. Capacities assume the tent holds the event and nothing else; subtract guests if you&apos;re putting a dance floor, bar, or stage under the same canopy.
            </p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-center text-[14px] border-collapse">
                <thead>
                  <tr>
                    <th rowSpan={2} className="py-3 px-3 align-middle bg-[#111] text-white font-bold text-[13px] border border-[#111]">
                      Number of<br />Guests
                    </th>
                    <th colSpan={2} className="py-2 px-3 bg-[#111] text-white font-bold text-[13px] border border-[#111]">
                      Theater Row Seating:<br />
                      <span className="font-normal text-white/85">8–10 square feet per guest</span>
                    </th>
                    <th colSpan={2} className="py-2 px-3 bg-[#111] text-white font-bold text-[13px] border border-[#111]">
                      Cocktail Party:<br />
                      <span className="font-normal text-white/85">12–15 square feet per guest</span>
                    </th>
                    <th colSpan={2} className="py-2 px-3 bg-[#111] text-white font-bold text-[13px] border border-[#111]">
                      Banquet Event:<br />
                      <span className="font-normal text-white/85">20 square feet per guest</span>
                    </th>
                  </tr>
                  <tr>
                    <th className="py-2 px-3 bg-[#f7f7f7] font-semibold text-[12px] text-[#555] border border-[#e5e5e5]">square feet</th>
                    <th className="py-2 px-3 bg-[#f7f7f7] font-semibold text-[12px] text-[#555] border border-[#e5e5e5]">space</th>
                    <th className="py-2 px-3 bg-[#f7f7f7] font-semibold text-[12px] text-[#555] border border-[#e5e5e5]">square feet</th>
                    <th className="py-2 px-3 bg-[#f7f7f7] font-semibold text-[12px] text-[#555] border border-[#e5e5e5]">space</th>
                    <th className="py-2 px-3 bg-[#f7f7f7] font-semibold text-[12px] text-[#555] border border-[#e5e5e5]">square feet</th>
                    <th className="py-2 px-3 bg-[#f7f7f7] font-semibold text-[12px] text-[#555] border border-[#e5e5e5]">space</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZING.map((r, i) => (
                    <tr key={r.guests} className={i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
                      <td className="py-3 px-3 font-bold text-[#111] border border-[#e5e5e5]">{r.guests}</td>
                      <td className="py-3 px-3 text-[#555] border border-[#e5e5e5]">{r.theaterSqft.toLocaleString()}</td>
                      <td className="py-3 px-3 text-[#555] border border-[#e5e5e5]">{r.theaterSpace}</td>
                      <td className="py-3 px-3 text-[#555] border border-[#e5e5e5]">{r.cocktailSqft.toLocaleString()}</td>
                      <td className="py-3 px-3 text-[#555] border border-[#e5e5e5]">{r.cocktailSpace}</td>
                      <td className="py-3 px-3 text-[#555] border border-[#e5e5e5]">{r.banquetSqft.toLocaleString()}</td>
                      <td className="py-3 px-3 text-[#555] border border-[#e5e5e5]">{r.banquetSpace}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl border border-[#e5e5e5] bg-white p-6 sm:p-10">
            <h2 className="text-[#111] font-bold text-[24px] sm:text-[28px]">Site, power, and permits</h2>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-[15px] leading-[1.7] text-[#555]">
              <div>
                <h3 className="text-[#111] font-semibold text-[16px]">Surface</h3>
                <p className="mt-2">Grass and dirt accept stakes; pavement and pool decks need ballast (water barrels or concrete weights). Frame tents handle both.</p>
              </div>
              <div>
                <h3 className="text-[#111] font-semibold text-[16px]">Wind &amp; weather</h3>
                <p className="mt-2">Oahu trade winds are real. Tell us about your exposure (open ocean, ridgeline, valley) and we&apos;ll spec anchoring and sidewalls accordingly.</p>
              </div>
              <div>
                <h3 className="text-[#111] font-semibold text-[16px]">Power &amp; lighting</h3>
                <p className="mt-2">Off-grid sites need a generator sized for lighting, AV, and catering. For lighting, choose from bistro string lights, par-can color washes, perimeter LED, and chandeliers.</p>
              </div>
              <div>
                <h3 className="text-[#111] font-semibold text-[16px]">Permits</h3>
                <p className="mt-2">Tents over a certain size require a Honolulu Fire Department permit. Plan at least two weeks ahead. Public-park and beach permits take longer.</p>
              </div>
              <div>
                <h3 className="text-[#111] font-semibold text-[16px]">Sidewalls</h3>
                <p className="mt-2">Solid walls for privacy and wind, clear walls for ocean views, French-window walls for an indoor-outdoor feel. Worth deciding before final pricing.</p>
              </div>
              <div>
                <h3 className="text-[#111] font-semibold text-[16px]">Site visit</h3>
                <p className="mt-2">For anything 30 ft or larger, or any site we haven&apos;t tented before, we recommend a walk-through. We can also pre-check most sites by satellite.</p>
              </div>
            </div>
          </article>

          <div className="text-center">
            <p className="text-[15px] text-[#555] mb-5">Ready to spec a tent for your event?</p>
            <Link
              href="/contact"
              className="inline-block px-8 py-3 text-[12px] font-bold uppercase tracking-[0.18em] text-white bg-[#111] hover:bg-[#ff6c0e] transition-colors"
              style={{ borderRadius: 0 }}
            >
              Talk to an event specialist
            </Link>
            <p className="mt-4 text-[13px] text-[#888]">
              Or call <a href={`tel:${SITE.phone.replace(/\D/g, "")}`} className="font-semibold text-[#111] underline-offset-4 hover:underline">{SITE.phone}</a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
