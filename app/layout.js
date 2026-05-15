import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ebimmo.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "E&B Immo — Agence immobilière Deauville, Trouville, Honfleur | Côte Fleurie",
    template: "%s | E&B Immo",
  },
  description:
    "E&B Immo, agence immobilière digitale sur la Côte Fleurie. Achat, vente, location et estimation gratuite à Deauville, Trouville, Honfleur, Cabourg, Houlgate et alentours en Normandie.",
  keywords: [
    "agence immobilière Deauville",
    "agence immobilière Trouville",
    "agence immobilière Honfleur",
    "agence immobilière Cabourg",
    "immobilier Côte Fleurie",
    "immobilier Normandie",
    "vente maison Deauville",
    "villa bord de mer Normandie",
    "estimation immobilière gratuite",
    "E&B Immo",
  ],
  authors: [{ name: "E&B Immo" }],
  creator: "E&B Immo",
  publisher: "E&B Immo",
  applicationName: "E&B Immo",
  category: "real estate",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: "E&B Immo",
    title: "E&B Immo — Agence immobilière de la Côte Fleurie",
    description:
      "Achat, vente, location et estimation gratuite sur Deauville, Trouville, Honfleur, Cabourg et la Côte Fleurie.",
    images: [
      {
        url: "/home-hero.avif",
        width: 1200,
        height: 630,
        alt: "E&B Immo — Côte Fleurie",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "E&B Immo — Agence immobilière de la Côte Fleurie",
    description:
      "Achat, vente, location et estimation gratuite sur la Côte Fleurie en Normandie.",
    images: ["/home-hero.avif"],
  },
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  formatDetection: { telephone: true, email: true, address: true },
};

export const viewport = {
  themeColor: "#0d0e13",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "E&B Immo",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  image: `${SITE_URL}/home-hero.avif`,
  description:
    "Agence immobilière digitale sur la Côte Fleurie : achat, vente, location et estimation à Deauville, Trouville, Honfleur, Cabourg et alentours.",
  email: "contact@eb-immo.fr",
  telephone: "+33760953618",
  priceRange: "€€€",
  areaServed: [
    { "@type": "City", name: "Deauville" },
    { "@type": "City", name: "Trouville-sur-Mer" },
    { "@type": "City", name: "Honfleur" },
    { "@type": "City", name: "Cabourg" },
    { "@type": "City", name: "Houlgate" },
    { "@type": "City", name: "Villers-sur-Mer" },
    { "@type": "City", name: "Blonville-sur-Mer" },
    { "@type": "AdministrativeArea", name: "Côte Fleurie" },
    { "@type": "AdministrativeArea", name: "Calvados" },
    { "@type": "AdministrativeArea", name: "Normandie" },
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "FR",
    addressRegion: "Normandie",
    addressLocality: "Deauville",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: "+33760953618",
    email: "contact@eb-immo.fr",
    areaServed: "FR",
    availableLanguage: ["French", "English"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
