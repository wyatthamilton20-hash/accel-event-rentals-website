"use client";

import { ArrowRightIcon, FacebookIcon, InstagramIcon } from "@/components/icons";
import { SITE } from "@/lib/site-config";

const socialLinks = [
  { icon: FacebookIcon, href: SITE.social.facebook, label: "Facebook" },
  { icon: InstagramIcon, href: SITE.social.instagram, label: "Instagram" },
] as const;

const feedImages = [
  { src: "/images/social/_DSC2706.jpg",                        alt: "Accel Event Rentals event" },
  { src: "/images/social/Venue5_AER.png",                      alt: "Accel Event Rentals venue setup" },
  { src: "/images/social/9.10.22_sunset.jpg",                  alt: "Accel Event Rentals sunset event" },
  { src: "/images/social/IMG_0892.jpg",                        alt: "Accel Event Rentals event" },
  { src: "/images/social/1.png",                               alt: "Accel Event Rentals event" },
  { src: "/images/social/_DSC2719.jpg",                        alt: "Accel Event Rentals event" },
  { src: "/images/social/OB3A0757.jpg",                        alt: "Accel Event Rentals event" },
  { src: "/images/social/Four-Seasons_Accel-Events-Tents.png", alt: "Four Seasons tented event by Accel Events & Tents" },
  { src: "/images/social/2.png",                               alt: "Accel Event Rentals event" },
  { src: "/images/social/Venue6_AER.png",                      alt: "Accel Event Rentals venue setup" },
  { src: "/images/social/2025-08-11---sneak-21.jpg",           alt: "Accel Event Rentals event sneak peek" },
];

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
        Let&apos;s Get Social<span style={{ color: "#ff6c0e" }}>.</span>
      </h2>

      {/* Social Icons */}
      <div className="flex justify-center items-center gap-3 my-8">
        {socialLinks.map(({ icon: Icon, href, label }) => {
          const external = /^https?:/.test(href);
          return (
            <a
              key={label}
              href={href}
              aria-label={label}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center justify-center w-12 h-12 rounded-full text-[#111] transition-colors hover:border-[#111]"
              style={{ border: "1.5px solid #d0d0d0" }}
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          );
        })}
      </div>

      {/* Follow Us button */}
      <a
        href={SITE.social.instagram}
        {...(/^https?:/.test(SITE.social.instagram)
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="inline-flex items-center gap-2.5 bg-[#ff6c0e] text-white px-9 py-[18px] text-[15px] font-bold no-underline transition-colors hover:bg-[#e55d00]"
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
            <a
              key={`${img.alt}-${index}`}
              href={SITE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on Instagram"
              className="block w-[200px] sm:w-[260px] h-[200px] sm:h-[300px] shrink-0 overflow-hidden transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6c0e] focus-visible:ring-offset-2"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
