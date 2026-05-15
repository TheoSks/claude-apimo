import Link from "next/link";

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
      }}
    >
      <Link href="/" style={{ fontWeight: 700, fontSize: 20, color: C.bush, textDecoration: "none" }}>
        E&amp;B Immo
      </Link>
      <nav style={{ display: "flex", gap: 20, fontSize: 14 }}>
        <Link href="/" style={{ color: C.bush, textDecoration: "none" }}>Accueil</Link>
        <Link href="/#annonces" style={{ color: C.bush, textDecoration: "none" }}>Annonces</Link>
        <Link href="/#estimation" style={{ color: C.bush, textDecoration: "none" }}>Estimation</Link>
        <Link href="/#contact" style={{ color: C.bush, textDecoration: "none" }}>Contact</Link>
      </nav>
    </header>
  );
}

export function SeoFooter() {
  return (
    <footer
      style={{
        padding: "32px 24px",
        borderTop: `1px solid ${C.bush}1a`,
        marginTop: 48,
        background: C.cream,
        fontSize: 13,
        color: C.bush,
        textAlign: "center",
      }}
    >
      <p style={{ marginBottom: 8 }}>
        <strong>E&amp;B Immo</strong> — Agence immobilière digitale de la Côte Fleurie
      </p>
      <p>
        <a href="tel:+33760953618" style={{ color: C.cyan }}>07 60 95 36 18</a> ·{" "}
        <a href="mailto:contact@eb-immo.fr" style={{ color: C.cyan }}>contact@eb-immo.fr</a>
      </p>
    </footer>
  );
}

export const SEO_COLORS = C;
