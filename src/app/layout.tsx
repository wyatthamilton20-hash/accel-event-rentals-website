import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import { SITE } from "@/lib/site-config";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const title = "Accel Event Rentals | Hawaii's Go-To Event Rental Company";
const description =
  "Hawaii's top event rental company! Accel Event Rentals offers premium tents, lounge furniture & rentals for weddings, corporate events & more on Oahu & Maui";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: title,
    template: "%s | Accel Event Rentals",
  },
  description,
  applicationName: SITE.name,
  keywords: [
    "Hawaii event rentals",
    "Oahu event rentals",
    "Maui event rentals",
    "wedding rentals Hawaii",
    "tent rentals",
    "tabletop rentals",
    "lounge furniture rentals",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title,
    description,
    images: [
      {
        url: "/images/hero/1.jpg",
        width: 1200,
        height: 630,
        alt: "Accel Event Rentals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/hero/1.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Script
          src="https://heygabby.net/widget.js?id=demo-accel-event-rentals-zmrf"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
