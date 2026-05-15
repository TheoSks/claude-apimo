import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllProperties,
  getPropertyByRef,
  propertyPath,
  propertyTitle,
  propertyImage,
  priceFmt,
  typeLabel,
  categoryLabel,
  cityName,
  slugify,
} from "../../_lib/apimo";
import { findCity } from "../../_lib/cities";
import { SeoHeader, SeoFooter, SEO_COLORS as C } from "../../_components/SeoShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eb-immo.fr";

export const revalidate = 600;

export async function generateStaticParams() {
  const list = await getAllProperties();
  return list.slice(0, 100).map((p) => ({
    ref: `${p.reference || p.id}-${slugify(typeLabel(p))}-${slugify(cityName(p))}`,
  }));
}

function extractRef(slug) {
  return String(slug || "").split("-")[0];
}

export async function generateMetadata({ params }) {
  const { ref } = await params;
  const p = await getPropertyByRef(extractRef(ref));
  if (!p) return {};

  const title = propertyTitle(p);
  const city = cityName(p);
  const price = priceFmt(p.price?.value);
  const description = `${typeLabel(p)} ${
    p.area?.value ? `de ${p.area.value} m²` : ""
  } à ${city} — ${price}. ${
    p.rooms ? `${p.rooms} pièces` : ""
  }${p.bedrooms ? `, ${p.bedrooms} chambres` : ""}. Découvrez ce bien proposé par E&B Immo, agence immobilière de la Côte Fleurie.`.replace(
    /\s+/g,
    " "
  ).trim();
  const url = `${SITE_URL}${propertyPath(p)}`;
  const img = propertyImage(p);

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
      images: img ? [{ url: img, alt: title }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: img ? [img] : undefined },
  };
}

export default async function BienPage({ params }) {
  const { ref } = await params;
  const p = await getPropertyByRef(extractRef(ref));
  if (!p) notFound();

  const title = propertyTitle(p);
  const city = cityName(p);
  const citySlug = slugify(city);
  const cityInfo = findCity(citySlug);
  const img = propertyImage(p);
  const allImages = (p.pictures || []).map((pic) => pic.url).filter(Boolean);
  const url = `${SITE_URL}${propertyPath(p)}`;

  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    description: `${typeLabel(p)} à ${city}${p.area?.value ? `, ${p.area.value} m²` : ""}${
      p.rooms ? `, ${p.rooms} pièces` : ""
    }.`,
    image: allImages.length ? allImages : undefined,
    sku: String(p.reference || p.id),
    brand: { "@type": "Brand", name: "E&B Immo" },
    offers: p.price?.value
      ? {
          "@type": "Offer",
          url,
          priceCurrency: p.price?.currency || "EUR",
          price: p.price.value,
          availability: "https://schema.org/InStock",
          seller: { "@type": "RealEstateAgent", name: "E&B Immo" },
        }
      : undefined,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      ...(cityInfo
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: `Agence ${cityInfo.name}`,
              item: `${SITE_URL}/agence/${cityInfo.slug}`,
            },
            { "@type": "ListItem", position: 3, name: title, item: url },
          ]
        : [{ "@type": "ListItem", position: 2, name: title, item: url }]),
    ],
  };

  return (
    <>
      <SeoHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", color: C.bush }}>
        <nav style={{ fontSize: 13, marginBottom: 16, color: `${C.bush}99` }}>
          <Link href="/" style={{ color: "inherit" }}>Accueil</Link>
          {cityInfo && (
            <>
              {" › "}
              <Link href={`/agence/${cityInfo.slug}`} style={{ color: "inherit" }}>
                Agence {cityInfo.name}
              </Link>
            </>
          )}
          {" › "}
          <span>{title}</span>
        </nav>

        <div style={{ fontSize: 13, color: `${C.bush}88`, marginBottom: 8 }}>
          {categoryLabel(p)} · {typeLabel(p)} · Réf. {p.reference || p.id}
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>{title}</h1>
        <div style={{ fontSize: 28, fontWeight: 700, color: C.cyan, marginBottom: 24 }}>
          {priceFmt(p.price?.value)}
        </div>

        {img && (
          <img
            src={img}
            alt={title}
            style={{
              width: "100%",
              maxHeight: 560,
              objectFit: "cover",
              borderRadius: 12,
              marginBottom: 20,
            }}
          />
        )}

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
          {p.area?.value ? <Spec k="Surface" v={`${p.area.value} m²`} /> : null}
          {p.rooms ? <Spec k="Pièces" v={p.rooms} /> : null}
          {p.bedrooms ? <Spec k="Chambres" v={p.bedrooms} /> : null}
          {city ? <Spec k="Ville" v={city} /> : null}
        </section>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Description</h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {p.comments?.[0]?.comment ||
              `${typeLabel(p)} ${p.area?.value ? `de ${p.area.value} m²` : ""} à ${city}${
                p.rooms ? `, comprenant ${p.rooms} pièces` : ""
              }${p.bedrooms ? ` dont ${p.bedrooms} chambres` : ""}.`}
          </p>
        </section>

        <section
          style={{
            padding: 24,
            background: C.cream || "#f7f4ee",
            borderRadius: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Intéressé par ce bien ?</div>
            <div style={{ fontSize: 14 }}>
              Contactez E&amp;B Immo au{" "}
              <a href="tel:+33760953618" style={{ color: C.cyan, fontWeight: 600 }}>07 60 95 36 18</a>{" "}
              ou{" "}
              <a href="mailto:contact@eb-immo.fr" style={{ color: C.cyan, fontWeight: 600 }}>
                contact@eb-immo.fr
              </a>
            </div>
          </div>
          <Link
            href="/#contact"
            style={{
              padding: "12px 24px",
              background: C.cyan,
              color: "#fff",
              borderRadius: 999,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Demander une visite
          </Link>
        </section>
      </main>
      <SeoFooter />
    </>
  );
}

function Spec({ k, v }) {
  return (
    <div style={{ padding: 14, border: `1px solid ${C.bush}1a`, borderRadius: 10 }}>
      <div style={{ fontSize: 12, color: `${C.bush}88`, marginBottom: 4 }}>{k}</div>
      <div style={{ fontSize: 16, fontWeight: 600 }}>{v}</div>
    </div>
  );
}
