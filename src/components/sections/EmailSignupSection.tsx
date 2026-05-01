import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function EmailSignupSection() {
  return (
    <section
      className="w-full px-4 sm:px-6 py-10 sm:py-14 text-center"
      style={{ background: "#e8e5e0", borderRadius: "20px 20px 0 0" }}
    >
      <h2 style={{ fontWeight: 700, color: "#111111", margin: 0, lineHeight: 1.1, fontSize: "clamp(28px, 7vw, 64px)" }}>
        Get on the list<span style={{ color: "#ff6c0e" }}>.</span>
      </h2>
      <p className="mt-2 text-[15px] text-[#111] max-sm:text-sm">
        Score VIP access to special offers, event photos, new products, and more.
      </p>
      <NewsletterForm variant="hero" />
    </section>
  );
}
