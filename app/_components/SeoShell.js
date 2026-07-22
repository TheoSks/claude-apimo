import Link from "next/link";
import { CITIES } from "../_lib/cities";

const C = { bush: "#0d0e13", cyan: "#24afc5", cream: "#f7f4ee" };

export function SeoHeader() {
  return (
    <header
      style={{
        padding: "20px 24px",
        borderBottom: `1px solid ${C.bush}1a`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#fff",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <Link href="/" style={{ fontWeight: 700, fontSize: 20, color: C.bush, textDecoration: "none" }}>
        E&amp;B Immo
      </Link>
      <nav style={{ display: "flex", gap: 20, fontSize: 14, flexWrap: "wrap" }}>
        <Link href="/" style={{ color: C.bush, textDecoration: "none" }}>Accueil</Link>
        <Link href="/#annonces" style={{ color: C.bush, textDecoration: "none" }}>Annonces</Link>
        <Link href="/estimation" style={{ color: C.bush, textDecoration: "none" }}>Estimation</Link>
        <Link href="/guides" style={{ color: C.bush, textDecoration: "none" }}>Guides</Link>
        <Link href="/#contact" style={{ color: C.bush, textDecoration: "none" }}>Contact</Link>
      </nav>
    </header>
  );
}

export function SeoFooter() {
  return (
    <footer
      style={{
        padding: "40px 24px 32px",
        borderTop: `1px solid ${C.bush}1a`,
        marginTop: 48,
        background: C.cream,
        fontSize: 13,
        color: C.bush,
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Nos agences sur la Côte Fleurie</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CITIES.map((c) => (
              <Link
                key={c.slug}
                href={`/agence/${c.slug}`}
                style={{
                  padding: "6px 12px",
                  border: `1px solid ${C.bush}22`,
                  borderRadius: 999,
                  textDecoration: "none",
                  color: C.bush,
                }}
              >
                Agence {c.name}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.bush}14`, paddingTop: 16, textAlign: "center" }}>
          <p style={{ marginBottom: 8 }}>
            <strong>E&amp;B Immo</strong> — Agence immobilière de la Côte Fleurie · 3 place du Commerce, 14860 Bavent
          </p>
          <p>
            <a href="tel:+33760953618" style={{ color: C.cyan }}>07 60 95 36 18</a> ·{" "}
            <a href="mailto:contact@eb-immo.fr" style={{ color: C.cyan }}>contact@eb-immo.fr</a> ·{" "}
            <Link href="/estimation" style={{ color: C.cyan }}>Estimation gratuite</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

export const SEO_COLORS = C;
