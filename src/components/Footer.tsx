import Image from "next/image";
import { FacebookIcon, InstagramIcon, YoutubeIcon, PinterestIcon } from "@/components/icons";

const footerColumns = {
  rentals: {
    title: "Rentals",
    links: [
      "What's New",
      "Tents",
      "Furnishings",
      "Tabletop",
      "Catering",
      "Decor",
      "More for Your Event",
    ],
  },
  showrooms: {
    title: "Showrooms",
    links: ["Oahu (HQ)", "Maui"],
  },
  quickLinks: {
    title: "Quick Links",
    links: [
      "About Us",
      "What We Do",
      "Account",
      "Contact Us",
      "Featured Events",
      "Gallery",
      "Privacy Policy",
    ],
  },
};

const socialLinks = [
  { icon: FacebookIcon, label: "Facebook" },
  { icon: InstagramIcon, label: "Instagram" },
  { icon: YoutubeIcon, label: "YouTube" },
  { icon: PinterestIcon, label: "Pinterest" },
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
  links: string[];
}) {
  return (
    <div>
      <h3 style={columnTitleStyle}>{title}</h3>
      <nav>
        {links.map((link) => (
          <a key={link} href="#" className="footer-link" style={linkStyle}>
            {link}
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
        <FooterLinkColumn
          title={footerColumns.rentals.title}
          links={footerColumns.rentals.links}
        />
        <FooterLinkColumn
          title={footerColumns.showrooms.title}
          links={footerColumns.showrooms.links}
        />
        <FooterLinkColumn
          title={footerColumns.quickLinks.title}
          links={footerColumns.quickLinks.links}
        />

        {/* Column 4: Connect With Us */}
        <div>
          <h3 style={columnTitleStyle}>Connect With Us</h3>
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            {socialLinks.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
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
            ))}
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

          <form style={{ display: "flex", position: "relative", maxWidth: "320px" }}>
            <input
              type="email"
              placeholder="Enter your email"
              required
              style={{
                flex: 1,
                background: "transparent",
                border: "2px solid #111111",
                padding: "10px 90px 10px 16px",
                fontSize: "16px",
                color: "#111111",
                borderRadius: "50px",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              type="submit"
              style={{
                position: "absolute",
                right: "4px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "#111111",
                color: "#ffffff",
                padding: "8px 20px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "1px",
                borderRadius: "50px",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              SIGN UP
            </button>
          </form>
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

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style>{`
        .footer-link:hover {
          color: #111111 !important;
        }
        .footer-social-icon:hover {
          background: #111111 !important;
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
