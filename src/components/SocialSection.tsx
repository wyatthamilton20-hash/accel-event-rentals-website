"use client";

import { ArrowRightIcon, FacebookIcon, InstagramIcon, YoutubeIcon, PinterestIcon } from "@/components/icons";

const socialLinks = [
  { icon: FacebookIcon, href: "#", label: "Facebook" },
  { icon: InstagramIcon, href: "#", label: "Instagram" },
  { icon: YoutubeIcon, href: "#", label: "YouTube" },
  { icon: PinterestIcon, href: "#", label: "Pinterest" },
] as const;

const feedImages = Array.from({ length: 8 }, (_, i) => ({
  src: `/images/hero/${(i % 8) + 1}.jpg`,
  alt: `Social feed photo ${i + 1}`,
}));

export function SocialSection() {
  return (
    <section
      className="py-12 sm:py-[90px] px-4 sm:px-6 text-center"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <h2
        style={{
          fontSize: "clamp(32px, 6vw, 72px)",
          fontWeight: 700,
          color: "#111111",
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        Let&apos;s Get Social.
      </h2>

      {/* Social Icons */}
      <div className="flex justify-center items-center gap-3 my-8">
        {socialLinks.map(({ icon: Icon, href, label }) => (
          <a
            key={label}
            href={href}
            aria-label={label}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full text-[#111] transition-colors hover:border-[#111]"
            style={{ border: "1.5px solid #d0d0d0" }}
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        ))}
      </div>

      {/* Follow Us button */}
      <a
        href="#"
        className="inline-flex items-center gap-2.5 bg-[#111] text-white px-9 py-[18px] text-[15px] font-bold no-underline transition-colors hover:bg-[#333]"
        style={{ borderRadius: 37, letterSpacing: "-0.01em" }}
      >
        Follow Us
        <ArrowRightIcon className="w-5 h-5" />
      </a>

      {/* Auto-scrolling marquee carousel */}
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee-scroll 35s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div className="overflow-hidden mt-10 sm:mt-12 w-full">
        <div className="marquee-track flex gap-2 w-max">
          {[...feedImages, ...feedImages].map((img, index) => (
            <div
              key={`${img.alt}-${index}`}
              className="w-[200px] sm:w-[260px] h-[200px] sm:h-[300px] shrink-0 overflow-hidden"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
