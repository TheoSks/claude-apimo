import EBImmo from "./eb-immo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ebimmo.com";

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "E&B Immo",
  url: SITE_URL,
  inLanguage: "fr-FR",
  publisher: { "@type": "Organization", name: "E&B Immo", url: SITE_URL },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Qui sommes-nous ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "E&B Immo est une agence immobilière créée par Emeline Burel et Benjamin, fondée en 2017. Nous accompagnons nos clients dans leurs projets d'achat, vente et location en Normandie.",
      },
    },
    {
      "@type": "Question",
      name: "Comment prendre rendez-vous ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Contactez-nous au +33 7 60 95 36 18 ou par email à contact@eb-immo.fr. Nous répondrons rapidement pour fixer un rendez-vous.",
      },
    },
    {
      "@type": "Question",
      name: "Quelle zone géographique couvrez-vous ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La côte fleurie, le Calvados et la Normandie principalement. Nous avons aussi des biens en Corse et en région parisienne.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <EBImmo />
    </>
  );
}
