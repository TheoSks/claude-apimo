import Link from "next/link";
import { notFound } from "next/navigation";
import { BUCKETS, findBucket } from "../../../_lib/buckets";
import { CITIES, findCity } from "../../../_lib/cities";
import {
  getAllProperties,
  propertyPath,
  propertyTitle,
  propertyImage,
  priceFmt,
  typeLabel,
  categoryLabel,
  slugify,
  cityName,
} from "../../../_lib/apimo";
import { SeoHeader, SeoFooter, SEO_COLORS as C } from "../../../_components/SeoShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ebimmo.com";

export const revalidate = 600;

export async function generateStaticParams() {
  const params = [];
  for (const b of BUCKETS) for (const c of CITIES) params.push({ bucket: b.slug, ville: c.slug });
  return params;
}

export async function generateMetadata({ params }) {
  const { bucket, ville } = await params;
  const b = findBucket(bucket);
  const city = findCity(ville);
  if (!b || !city) return {};
  const url = `${SITE_URL}/immobilier/${b.slug}/${city.slug}`;
  return {
    title: b.title(city.name),
    description: b.description(city.name),
    alternates: { canonical: url },
    openGraph: {
      title: b.title(city.name),
      description: b.description(city.name),
      url,
      type: "website",
      locale: "fr_FR",
      siteName: "E&B Immo",
    },
    twitter: { card: "summary_large_image", title: b.title(city.name), description: b.description(city.name) },
  };
}

export default async function MatrixPage({ params }) {
  const { bucket, ville } = await params;
  const b = findBucket(bucket);
  const city = findCity(ville);
  if (!b || !city) notFound();

  const all = await getAllProperties();
  const properties = all.filter((p) => slugify(cityName(p)) === city.slug && b.match(p));

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: `Agence ${city.name}`, item: `${SITE_URL}/agence/${city.slug}` },
      {
        "@type": "ListItem",
        position: 3,
        name: b.h1(city.name),
        item: `${SITE_URL}/immobilier/${b.slug}/${city.slug}`,
      },
    ],
  };

  const label = b.h1(city.name);
  const labelLc = label.toLowerCase();
  const faqs = [
    {
      q: `${label} : combien d'annonces sont disponibles chez E&B Immo ?`,
      a:
        properties.length > 0
          ? `E&B Immo propose actuellement ${properties.length} annonce${
              properties.length > 1 ? "s" : ""
            } correspondant à « ${labelLc} ». Cette sélection est mise à jour en continu depuis notre catalogue.`
          : `Aucune annonce ne correspond actuellement à « ${labelLc} ». Contactez E&B Immo au 07 60 95 36 18 pour être alerté dès qu'un bien correspondant est publié.`,
    },
    {
      q: `Pourquoi passer par E&B Immo pour « ${labelLc} » ?`,
      a: `Agence indépendante de la Côte Fleurie fondée en 2017, E&B Immo conjugue une connaissance fine du marché de ${city.name} et un accompagnement personnalisé, de la recherche à la signature.`,
    },
    {
      q: `Comment être informé des nouveaux biens « ${labelLc} » ?`,
      a: `Appelez E&B Immo au 07 60 95 36 18 ou écrivez à contact@eb-immo.fr pour créer une alerte personnalisée. Vous pouvez aussi demander une estimation gratuite si vous souhaitez vendre à ${city.name}.`,
    },
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <SeoHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", color: C.bush }}>
        <nav style={{ fontSize: 13, marginBottom: 16, color: `${C.bush}99` }}>
          <Link href="/" style={{ color: "inherit" }}>Accueil</Link> ›{" "}
          <Link href={`/agence/${city.slug}`} style={{ color: "inherit" }}>Agence {city.name}</Link> ›{" "}
          <span>{b.typeLabel} — {b.transaction}</span>
        </nav>

        <h1 style={{ fontSize: 38, fontWeight: 700, marginBottom: 12 }}>{b.h1(city.name)}</h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, marginBottom: 32, maxWidth: 820 }}>
          {b.intro(city.name)}
        </p>

        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>
          {properties.length > 0
            ? `${properties.length} bien${properties.length > 1 ? "s" : ""} disponible${properties.length > 1 ? "s" : ""}`
            : `Aucune annonce active actuellement`}
        </h2>

        {properties.length === 0 ? (
          <p style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 800 }}>
            Aucune annonce ne correspond actuellement à « {b.h1(city.name)} ».
            Contactez E&amp;B Immo au{" "}
            <a href="tel:+33760953618" style={{ color: C.cyan, fontWeight: 600 }}>07 60 95 36 18</a>{" "}
            pour être alerté dès qu'un nouveau bien correspondant à votre recherche est publié, ou
            consultez{" "}
            <Link href={`/agence/${city.slug}`} style={{ color: C.cyan }}>
              tous nos biens à {city.name}
            </Link>
            .
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 24,
            }}
          >
            {properties.map((p) => {
              const img = propertyImage(p);
              return (
                <Link
                  key={p.id || p.reference}
                  href={propertyPath(p)}
                  style={{
                    border: `1px solid ${C.bush}1a`,
                    borderRadius: 12,
                    overflow: "hidden",
                    textDecoration: "none",
                    color: C.bush,
                    background: "#fff",
                  }}
                >
                  {img && (
                    <img
                      src={img}
                      alt={propertyTitle(p)}
                      loading="lazy"
                      style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }}
                    />
                  )}
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 12, color: `${C.bush}88`, marginBottom: 4 }}>
                      {categoryLabel(p)} · {typeLabel(p)}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                      {propertyTitle(p)}
                    </h3>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.cyan }}>
                      {priceFmt(p.price?.value)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
            Questions fréquentes
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {faqs.map((f, i) => (
              <div key={i}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{f.q}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: `${C.bush}cc`, maxWidth: 820 }}>
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Recherches associées</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {BUCKETS.filter((x) => x.slug !== b.slug).map((x) => (
              <Link
                key={x.slug}
                href={`/immobilier/${x.slug}/${city.slug}`}
                style={{
                  padding: "8px 14px",
                  border: `1px solid ${C.bush}33`,
                  borderRadius: 999,
                  textDecoration: "none",
                  color: C.bush,
                  fontSize: 13,
                }}
              >
                {x.h1(city.name)}
              </Link>
            ))}
            {CITIES.filter((x) => x.slug !== city.slug).map((x) => (
              <Link
                key={x.slug}
                href={`/immobilier/${b.slug}/${x.slug}`}
                style={{
                  padding: "8px 14px",
                  border: `1px solid ${C.bush}33`,
                  borderRadius: 999,
                  textDecoration: "none",
                  color: C.bush,
                  fontSize: 13,
                }}
              >
                {b.h1(x.name)}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SeoFooter />
    </>
  );
}
