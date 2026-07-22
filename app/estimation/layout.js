const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ebimmo.com";

const title = "Estimation immobilière gratuite en ligne — Deauville, Côte Fleurie";
const description =
  "Estimez gratuitement et en 2 minutes la valeur de votre bien immobilier sur la Côte Fleurie (Deauville, Trouville, Honfleur, Cabourg…). Estimation en ligne réalisée par un agent E&B Immo, sans engagement.";
const url = `${SITE_URL}/estimation`;

export const metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: "website",
    locale: "fr_FR",
    siteName: "E&B Immo",
    images: [{ url: "/hero-drone.jpg", width: 1200, height: 630, alt: "Estimation immobilière E&B Immo" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/hero-drone.jpg"] },
};

const serviceLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Estimation immobilière gratuite",
  name: "Estimation immobilière gratuite E&B Immo",
  description,
  url,
  areaServed: [
    "Deauville", "Trouville-sur-Mer", "Honfleur", "Cabourg", "Houlgate",
    "Villers-sur-Mer", "Blonville-sur-Mer", "Varaville", "Côte Fleurie", "Calvados", "Normandie",
  ].map((name) => ({ "@type": "City", name })),
  provider: {
    "@type": "RealEstateAgent",
    name: "E&B Immo",
    telephone: "+33760953618",
    email: "contact@eb-immo.fr",
    url: SITE_URL,
  },
  offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "L'estimation immobilière E&B Immo est-elle gratuite ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui, l'estimation de votre bien avec E&B Immo est 100 % gratuite et sans engagement. Vous recevez une fourchette de prix indicative, affinée par un agent immobilier local.",
      },
    },
    {
      "@type": "Question",
      name: "Combien de temps prend une estimation en ligne ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le questionnaire d'estimation en ligne se remplit en environ 2 minutes. Vous obtenez une première estimation immédiate, puis un agent E&B Immo vous recontacte pour l'affiner.",
      },
    },
    {
      "@type": "Question",
      name: "Sur quelles communes estimez-vous les biens ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "E&B Immo estime les biens sur toute la Côte Fleurie : Deauville, Trouville-sur-Mer, Honfleur, Cabourg, Houlgate, Villers-sur-Mer, Blonville-sur-Mer, Varaville et les communes environnantes du Calvados.",
      },
    },
    {
      "@type": "Question",
      name: "L'estimation en ligne remplace-t-elle une visite ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "L'estimation en ligne donne une première fourchette de prix. Pour une estimation précise, un agent E&B Immo se déplace gratuitement afin de tenir compte de l'état, de l'exposition et des spécificités de votre bien.",
      },
    },
  ],
};

export default function EstimationLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      {children}
    </>
  );
}
