import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, findCity, priceRange } from "../../_lib/cities";
import { BUCKETS } from "../../_lib/buckets";
import {
  getPropertiesByCitySlug,
  propertyPath,
  propertyTitle,
  propertyImage,
  priceFmt,
  typeLabel,
  categoryLabel,
} from "../../_lib/apimo";
import { SeoHeader, SeoFooter, SEO_COLORS as C } from "../../_components/SeoShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ebimmo.com";

export const revalidate = 600;

export async function generateStaticParams() {
  return CITIES.map((c) => ({ ville: c.slug }));
}

export async function generateMetadata({ params }) {
  const { ville } = await params;
  const city = findCity(ville);
  if (!city) return {};
  const title = `Agence immobilière ${city.name} — Vente, Achat, Estimation`;
  const description = `E&B Immo, votre agence immobilière à ${city.name} (${city.zipcode}). Découvrez nos biens à vendre et à louer sur la Côte Fleurie. Estimation gratuite et accompagnement personnalisé.`;
  const url = `${SITE_URL}/agence/${city.slug}`;
  return {
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
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function VillePage({ params }) {
  const { ville } = await params;
  const city = findCity(ville);
  if (!city) notFound();

  const properties = await getPropertiesByCitySlug(city.slug);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: `Agence ${city.name}`, item: `${SITE_URL}/agence/${city.slug}` },
    ],
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Biens immobiliers à ${city.name}`,
    numberOfItems: properties.length,
    itemListElement: properties.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}${propertyPath(p)}`,
      name: propertyTitle(p),
    })),
  };

  const aptRange = priceRange(city.priceApt);
  const houseRange = priceRange(city.priceHouse);

  const faqs = [
    {
      q: `Quel est le prix de l'immobilier à ${city.name} ?`,
      a: `À ${city.name} (${city.zipcode}), les prix se situent à titre indicatif autour de ${aptRange} pour un appartement et ${houseRange} pour une maison. Ces fourchettes varient fortement selon l'emplacement, la vue mer et l'état du bien. E&B Immo réalise une estimation gratuite et précise sur demande.`,
    },
    {
      q: `E&B Immo propose-t-elle une estimation gratuite à ${city.name} ?`,
      a: `Oui. E&B Immo réalise gratuitement et sans engagement l'estimation de votre bien à ${city.name}, en ligne en 2 minutes puis affinée par un agent local.`,
    },
    {
      q: `Quels types de biens E&B Immo gère-t-elle à ${city.name} ?`,
      a: `E&B Immo accompagne à ${city.name} la vente et la location de maisons, appartements et villas, ainsi que les terrains, immeubles, locaux commerciaux, le viager et la location saisonnière.`,
    },
    {
      q: `Comment contacter l'agence E&B Immo pour ${city.name} ?`,
      a: `Vous pouvez joindre E&B Immo au 07 60 95 36 18 ou par email à contact@eb-immo.fr. L'agence est basée 3 place du Commerce, 14860 Bavent, et couvre toute la Côte Fleurie.`,
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px", color: C.bush }}>
        <nav style={{ fontSize: 13, marginBottom: 16, color: `${C.bush}99` }}>
          <Link href="/" style={{ color: "inherit" }}>Accueil</Link> › <span>Agence {city.name}</span>
        </nav>

        <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 12 }}>
          Agence immobilière à {city.name}
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, marginBottom: 32, maxWidth: 800 }}>
          {city.intro}
        </p>

        <section>
          <h2 style={{ fontSize: 26, fontWeight: 600, marginBottom: 20 }}>
            {properties.length > 0
              ? `${properties.length} bien${properties.length > 1 ? "s" : ""} à ${city.name}`
              : `Nos biens à ${city.name}`}
          </h2>

          {properties.length === 0 ? (
            <p style={{ fontSize: 15, lineHeight: 1.6 }}>
              Aucun bien actuellement publié à {city.name}. Contactez-nous au{" "}
              <a href="tel:+33760953618" style={{ color: C.cyan }}>07 60 95 36 18</a> pour être informé
              des prochaines opportunités, ou consultez{" "}
              <Link href="/#annonces" style={{ color: C.cyan }}>l'ensemble de nos annonces</Link>.
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
                      display: "block",
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
        </section>

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
            Pourquoi choisir E&amp;B Immo à {city.name} ?
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 800 }}>
            Implantée sur la Côte Fleurie, l'agence E&amp;B Immo conjugue expertise locale et outils
            digitaux pour optimiser la vente, l'achat ou l'estimation de votre bien à {city.name}.
            Notre équipe vous accompagne à chaque étape avec transparence et réactivité.
          </p>
          <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/#estimation"
              style={{
                padding: "12px 24px",
                background: C.cyan,
                color: "#fff",
                borderRadius: 999,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Estimer mon bien à {city.name}
            </Link>
            <Link
              href="/#contact"
              style={{
                padding: "12px 24px",
                border: `1px solid ${C.bush}`,
                color: C.bush,
                borderRadius: 999,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Nous contacter
            </Link>
          </div>
        </section>

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
            Prix de l'immobilier à {city.name}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 800, marginBottom: 16 }}>
            À {city.name} ({city.zipcode}), le prix de l'immobilier se situe, à titre indicatif,
            autour de <strong>{aptRange}</strong> pour un appartement et{" "}
            <strong>{houseRange}</strong> pour une maison. Ces fourchettes sont données à titre
            informatif : le prix réel dépend fortement de l'emplacement, de la vue mer, de l'état et
            des prestations du bien.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ border: `1px solid ${C.bush}1a`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, color: `${C.bush}88`, marginBottom: 4 }}>Appartement</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.cyan }}>{aptRange}</div>
            </div>
            <div style={{ border: `1px solid ${C.bush}1a`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, color: `${C.bush}88`, marginBottom: 4 }}>Maison</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.cyan }}>{houseRange}</div>
            </div>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.6 }}>
            Pour connaître la valeur exacte de votre bien à {city.name},{" "}
            <Link href="/estimation" style={{ color: C.cyan, fontWeight: 600 }}>
              demandez une estimation gratuite
            </Link>
            .
          </p>
        </section>

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
            Questions fréquentes — immobilier à {city.name}
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
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
            Rechercher par type de bien à {city.name}
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 40 }}>
            {BUCKETS.map((b) => (
              <Link
                key={b.slug}
                href={`/immobilier/${b.slug}/${city.slug}`}
                style={{
                  padding: "8px 14px",
                  border: `1px solid ${C.bush}33`,
                  borderRadius: 999,
                  textDecoration: "none",
                  color: C.bush,
                  fontSize: 13,
                }}
              >
                {b.h1(city.name)}
              </Link>
            ))}
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
            Autres communes de la Côte Fleurie
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {CITIES.filter((c) => c.slug !== city.slug).map((c) => (
              <Link
                key={c.slug}
                href={`/agence/${c.slug}`}
                style={{
                  padding: "8px 14px",
                  border: `1px solid ${C.bush}33`,
                  borderRadius: 999,
                  textDecoration: "none",
                  color: C.bush,
                  fontSize: 13,
                }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SeoFooter />
    </>
  );
}
