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
import EBImmo from "../../eb-immo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ebimmo.com";

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
      {/* SEO/aperçu social conservés (métadonnées + données structurées) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Fiche complète : on rend l'application, ciblée sur ce bien */}
      <EBImmo initialPage="bien" initialRef={extractRef(ref)} />
    </>
  );
}
