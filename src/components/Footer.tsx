import Image from "next/image";
import { FacebookIcon, InstagramIcon, YoutubeIcon, PinterestIcon } from "@/components/icons";
import { NewsletterForm } from "@/components/NewsletterForm";
import { CATEGORIES } from "@/lib/category-map";
import { SITE } from "@/lib/site-config";

interface FooterLink {
  label: string;
  href: string;
}

const rentalLinks: FooterLink[] = CATEGORIES.map((c) => ({
  label: c.label,
  href: `/rentals/${c.slug}`,
}));

const showroomLinks: FooterLink[] = SITE.locations.map((loc) => ({
  label: loc.island === "Oahu" ? "Oahu (HQ)" : loc.island,
  href: "/contact",
}));

const quickLinks: FooterLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Gallery", href: "/gallery" },
  { label: "Featured Events", href: "/gallery" },
];

const socialLinks = [
  { icon: FacebookIcon, label: "Facebook", href: SITE.social.facebook },
  { icon: InstagramIcon, label: "Instagram", href: SITE.social.instagram },
  { icon: YoutubeIcon, label: "YouTube", href: SITE.social.youtube },
  { icon: PinterestIcon, label: "Pinterest", href: SITE.social.pinterest },
] as const;

const columnTitleStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  color: "#111111",
  marginBottom: "16px",
  marginTop: 0,
};

const linkStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#555555",
  lineHeight: 2,
  textDecoration: "none",
  display: "block",
  transition: "color 0.2s",
};

function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <h3 style={columnTitleStyle}>{title}</h3>
      <nav>
        {links.map((link) => (
          <a key={link.label} href={link.href} className="footer-link" style={linkStyle}>
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

export function Footer() {
  return (
    <footer style={{ background: "#f5efe6", color: "#111111", paddingTop: "48px" }}>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "grid",
          gridTemplateColumns: "repeat(1, 1fr)",
          gap: "32px",
        }}
        className="footer-grid"
      >
        <FooterLinkColumn title="Rentals" links={rentalLinks} />
        <FooterLinkColumn title="Showrooms" links={showroomLinks} />
        <FooterLinkColumn title="Quick Links" links={quickLinks} />

        {/* Column 4: Connect With Us */}
        <div>
          <h3 style={columnTitleStyle}>Connect With Us</h3>
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            {socialLinks.map(({ icon: Icon, label, href }) => {
              const external = /^https?:/.test(href);
              return (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    border: "2px solid #111111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#111111",
                    textDecoration: "none",
                    transition: "background 0.2s, color 0.2s",
                  }}
                  className="footer-social-icon"
                >
                  <Icon width={18} height={18} />
                </a>
              );
            })}
          </div>

          <p
            style={{
              fontSize: "14px",
              color: "#555555",
              marginTop: "0",
              marginBottom: "8px",
            }}
          >
            Join Our Newsletter
          </p>

          <NewsletterForm variant="footer" />
        </div>
      </div>

      {/* Footer bottom */}
      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.1)",
          marginTop: "40px",
          padding: "24px 0",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "24px", marginBottom: "12px" }}>
          <Image src="/images/logos/accel-logo.png" alt="Accel Event Rentals" width={110} height={34} style={{ filter: "invert(1)", height: 34, width: "auto" }} />
        </div>
        <p
          style={{
            fontSize: "12px",
            color: "rgba(0,0,0,0.4)",
            marginTop: "8px",
            marginBottom: 0,
          }}
        >
          &copy; 2026 Accel Event Rentals | All Rights Reserved
        </p>
      </div>

      <style>{`
        .footer-link:hover {
          color: #ff6c0e !important;
        }
        .footer-social-icon:hover {
          background: #ff6c0e !important;
          border-color: #ff6c0e !important;
          color: #ffffff !important;
        }
        @media (min-width: 640px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (min-width: 1024px) {
          .footer-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </footer>
  );
}
