import { RentalInquiryForm } from "@/app/contact/RentalInquiryForm";

export function RentalInquirySection() {
  return (
    <section
      className="w-full px-4 sm:px-6 py-12 sm:py-20"
      style={{ background: "#e8e5e0", borderRadius: "20px 20px 0 0" }}
    >
      <div className="max-w-[760px] mx-auto text-center">
        <h2 style={{ fontWeight: 700, color: "#111", margin: 0, lineHeight: 1.1, fontSize: "clamp(28px, 5vw, 56px)" }}>
          Get a quote from our sales team<span style={{ color: "#ff6c0e" }}>.</span>
        </h2>
      </div>
      <div className="max-w-[760px] mx-auto mt-8 sm:mt-12">
        <RentalInquiryForm />
      </div>
    </section>
  );
}
