import type { Metadata } from "next";
import type { ReactNode } from "react";
import { FACEBOOK_URL, GOOGLE_MAPS_DIRECTIONS_URL, INSTAGRAM_URL, TIKTOK_URL } from "@/lib/business-links";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const siteUrl = getSiteUrl();
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": `${siteUrl}/#restaurant`,
  name: "Amrogn Chicken - 4 Kilo",
  description:
    "Home of authentic shawarma in Addis Ababa: chicken shawarma, fire-grilled and roasted chicken, tandoor mofo and crispy fried chicken at Ambassador Mall, 4 Kilo.",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  image: `${siteUrl}/logo.png`,
  telephone: "+251978957070",
  priceRange: "ETB 150 - 1,450",
  currenciesAccepted: "ETB",
  servesCuisine: ["Chicken", "Shawarma", "Fast Food", "Grill"],
  hasMenu: `${siteUrl}/menu`,
  hasMap: GOOGLE_MAPS_DIRECTIONS_URL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ambassador Mall, Ground Floor, 4 Kilo",
    addressLocality: "Addis Ababa",
    addressCountry: "ET",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 9.0349875,
    longitude: 38.7587344,
  },
  openingHours: "Mo-Su 10:00-22:00",
  sameAs: ["https://amrogn.com", FACEBOOK_URL, INSTAGRAM_URL, TIKTOK_URL],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Amrogn Chicken • 4 Kilo Branch • Addis Ababa",
    template: "%s • Amrogn Chicken",
  },
  description:
    "Amrogn Chicken at Ambassador Mall, 4 Kilo, Addis Ababa. Famous chicken shawarma, roasted and fire-grilled chicken, tandoor mofo and crispy fried chicken. Scan your table QR to order, or browse the menu and reviews online.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  // PWA manifest — lets staff "Add to Home Screen" so pocket alerts work on iPhone.
  manifest: "/manifest.webmanifest",
  themeColor: "#1B1B20",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Local food photography ships with the app; warm the menu image CDNs used by admin uploads */}
        <link rel="preconnect" href="https://images.pexels.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema).replace(/</g, "\\u003c") }}
        />
      </head>
      <body className="bg-neutral-100 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
