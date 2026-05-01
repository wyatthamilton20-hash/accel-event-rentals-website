import Image from "next/image";
import { ArrowRightIcon } from "@/components/icons";

export function DesignCentersSection() {
  return (
    <section
      className="relative flex min-h-[450px] items-center justify-center md:min-h-[500px] lg:min-h-[560px]"
      style={{
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* Background Image */}
      <Image
        src="/images/design-centers-bg.jpg"
        alt="Design centers background"
        fill
        sizes="100vw"
        className="object-cover"
        style={{ zIndex: 0 }}
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.3))",
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 700,
          textAlign: "center",
          padding: "0 1.5rem",
        }}
      >
        {/* Heading */}
        <h2
          style={{
            fontSize: "clamp(40px, 5vw, 72px)",
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Our Showrooms.
        </h2>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.7,
            marginTop: 20,
            marginBottom: 36,
            maxWidth: 550,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Your next event starts here&mdash;stop by one of our showrooms to get
          inspired, discover ideas, and meet with our team.
        </p>

        {/* CTA Button — black pill with arrow */}
        <a
          href="#"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: "#111111",
            color: "#ffffff",
            padding: "18px 36px",
            borderRadius: 37,
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
            transition: "background-color 0.2s, transform 0.2s",
            letterSpacing: "-0.01em",
          }}
        >
          Plan Your Visit
          <ArrowRightIcon className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}
