import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, findGuide } from "../../_lib/guides";
import { SeoHeader, SeoFooter, SEO_COLORS as C } from "../../_components/SeoShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ebimmo.com";

export async function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const g = findGuide(slug);
  if (!g) return {};
  const url = `${SITE_URL}/guides/${g.slug}`;
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: url },
    openGraph: {
      title: g.title,
      description: g.description,
      url,
      type: "article",
      locale: "fr_FR",
      siteName: "E&B Immo",
      publishedTime: g.date,
    },
    twitter: { card: "summary_large_image", title: g.title, description: g.description },
  };
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const g = findGuide(slug);
  if (!g) notFound();

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.description,
    datePublished: g.date,
    dateModified: g.date,
    author: { "@type": "Organization", name: "E&B Immo" },
    publisher: {
      "@type": "Organization",
      name: "E&B Immo",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
    },
    mainEntityOfPage: `${SITE_URL}/guides/${g.slug}`,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
      { "@type": "ListItem", position: 3, name: g.title, item: `${SITE_URL}/guides/${g.slug}` },
    ],
  };

  return (
    <>
      <SeoHeader />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px", color: C.bush }}>
        <nav style={{ fontSize: 13, marginBottom: 16, color: `${C.bush}99` }}>
          <Link href="/" style={{ color: "inherit" }}>Accueil</Link> ›{" "}
          <Link href="/guides" style={{ color: "inherit" }}>Guides</Link> › <span>{g.title}</span>
        </nav>

        <div style={{ fontSize: 13, color: `${C.bush}88`, marginBottom: 8 }}>
          Publié le {new Date(g.date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>{g.title}</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, marginBottom: 32, color: `${C.bush}cc` }}>
          {g.excerpt}
        </p>

        <article>
          {g.body.map((block, i) =>
            block.h2 ? (
              <h2 key={i} style={{ fontSize: 24, fontWeight: 600, margin: "32px 0 12px" }}>
                {block.h2}
              </h2>
            ) : (
              <p key={i} style={{ fontSize: 16, lineHeight: 1.75, marginBottom: 16 }}>
                {block.p}
              </p>
            )
          )}
        </article>

        <section
          style={{
            marginTop: 48,
            padding: 24,
            background: "#f7f4ee",
            borderRadius: 12,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Un projet immobilier sur la Côte Fleurie ?</div>
          <div style={{ fontSize: 14, marginBottom: 14 }}>
            Profitez de l'expertise E&amp;B Immo pour estimer, acheter ou vendre votre bien.
          </div>
          <Link
            href="/#estimation"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: C.cyan,
              color: "#fff",
              borderRadius: 999,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Estimer mon bien gratuitement
          </Link>
        </section>

        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>À lire également</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {GUIDES.filter((x) => x.slug !== g.slug).map((x) => (
              <Link
                key={x.slug}
                href={`/guides/${x.slug}`}
                style={{ color: C.bush, fontSize: 15, textDecoration: "none", borderBottom: `1px solid ${C.bush}22`, paddingBottom: 8 }}
              >
                {x.title}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SeoFooter />
    </>
  );
}
