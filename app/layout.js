import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ebimmo.com";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "E&B Immo — Agence immobilière Bavent, Cabourg, Troarn | Côte Fleurie",
    template: "%s | E&B Immo",
  },
  description:
    "E&B Immo, agence immobilière sur la Côte Fleurie. Achat, vente, location et estimation gratuite à Bavent, Cabourg, Troarn, Merville-Franceville, Petiville et alentours en Normandie.",
  keywords: [
    "agence immobilière Bavent",
    "agence immobilière Cabourg",
    "agence immobilière Troarn",
    "agence immobilière Merville-Franceville",
    "agence immobilière Petiville",
    "immobilier Côte Fleurie",
    "immobilier Normandie",
    "vente maison Cabourg",
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
      "Achat, vente, location et estimation gratuite sur Bavent, Cabourg, Troarn, Merville-Franceville, Petiville et la Côte Fleurie.",
    images: [
      {
        url: "/hero-drone.jpg",
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
    images: ["/hero-drone.jpg"],
  },
  // Logo affiché par Google à côté du site dans les résultats de recherche
  // (Google exige une icône carrée, multiple de 48 px, accessible au robot).
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
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
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/icon-512.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/hero-drone.jpg`,
  description:
    "Agence immobilière sur la Côte Fleurie : achat, vente, location et estimation à Bavent, Cabourg, Troarn, Merville-Franceville, Petiville et alentours.",
  email: "contact@eb-immo.fr",
  telephone: "+33760953618",
  priceRange: "€€€",
  areaServed: [
    { "@type": "City", name: "Bavent" },
    { "@type": "City", name: "Cabourg" },
    { "@type": "City", name: "Troarn" },
    { "@type": "City", name: "Merville-Franceville-Plage" },
    { "@type": "City", name: "Petiville" },
    { "@type": "City", name: "Varaville" },
    { "@type": "City", name: "Houlgate" },
    { "@type": "AdministrativeArea", name: "Côte Fleurie" },
    { "@type": "AdministrativeArea", name: "Calvados" },
    { "@type": "AdministrativeArea", name: "Normandie" },
  ],
  address: {
    "@type": "PostalAddress",
    addressCountry: "FR",
    addressRegion: "Normandie",
    streetAddress: "3 place du Commerce",
    postalCode: "14860",
    addressLocality: "Bavent",
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
