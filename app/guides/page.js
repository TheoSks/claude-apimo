import Link from "next/link";
import { GUIDES } from "../_lib/guides";
import { SeoHeader, SeoFooter, SEO_COLORS as C } from "../_components/SeoShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ebimmo.com";

export const metadata = {
  title: "Guides immobilier — Côte Fleurie | E&B Immo",
  description:
    "Tous nos guides immobiliers pour acheter, vendre, estimer et investir sur la Côte Fleurie : prix au m², résidence secondaire, vente rapide.",
  alternates: { canonical: `${SITE_URL}/guides` },
  openGraph: {
    title: "Guides immobilier — Côte Fleurie",
    description: "Conseils experts E&B Immo pour acheter, vendre et investir sur la Côte Fleurie.",
    url: `${SITE_URL}/guides`,
    type: "website",
    locale: "fr_FR",
    siteName: "E&B Immo",
  },
};

export default function GuidesIndex() {
  return (
    <>
      <SeoHeader />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px", color: C.bush }}>
        <h1 style={{ fontSize: 38, fontWeight: 700, marginBottom: 12 }}>
          Guides immobilier — Côte Fleurie
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, marginBottom: 32, maxWidth: 800 }}>
          Conseils d'expert, analyses de marché et guides pratiques pour acheter, vendre, estimer
          ou investir sur la Côte Fleurie avec E&amp;B Immo.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              style={{
                border: `1px solid ${C.bush}1a`,
                borderRadius: 12,
                padding: 24,
                textDecoration: "none",
                color: C.bush,
                background: "#fff",
              }}
            >
              <div style={{ fontSize: 12, color: `${C.bush}88`, marginBottom: 8 }}>
                {new Date(g.date).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>
                {g.title}
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: `${C.bush}cc` }}>{g.excerpt}</p>
            </Link>
          ))}
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
