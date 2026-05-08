import { useState, useEffect, useRef, useCallback } from "react";

/* ═══ APIMO API CONFIG ═══ */
const APIMO_PROVIDER = "4019";
const APIMO_TOKEN = "5ccdef5377bd6f2f41681f17233c7818a3484333";
const APIMO_AGENCY = "23650";

/* Fallback API si Apimo non configuré */
const FALLBACK_API = "https://tst-drab-eta.vercel.app/api/properties";

/* Normalize Apimo property → format unifié */
function normalizeApimo(p) {
  const photos = (p.pictures || []).map(pic => pic.url).filter(Boolean);
  return {
    id: p.id,
    title: p.name || `${(p.type?.name || "Bien")} — ${(p.subtype?.name || "")}`.trim(),
    price: p.price?.value || 0,
    rooms: p.rooms || 0,
    bedrooms: p.bedrooms || 0,
    area: { value: p.area?.value || 0, total: p.area?.total || 0 },
    city: p.city?.name || "",
    zipcode: p.city?.zipcode || "",
    reference: p.reference || "",
    thumbnail: photos[0] || "",
    photos,
    url: p.url || "",
    description: (p.comments || []).map(c => c.comment).join(" ") || "",
    category: p.category?.name || "",
    type: p.type?.name || "",
    address: p.publish_address ? p.address : "",
    latitude: p.latitude,
    longitude: p.longitude,
    _raw: p,
  };
}

/* Normalize fallback API property */
function normalizeFallback(p) {
  return {
    ...p,
    city: p.city || "",
    photos: p.thumbnail ? [p.thumbnail] : [],
    description: "",
    category: "",
    type: "",
    address: "",
    _raw: p,
  };
}

/* Fetch from Apimo proxy or fallback */
async function fetchProperties() {
  // 1. Try Apimo via proxy on your Vercel (add api/apimo-properties.js to your project)
  const APIMO_PROXY = "/api/apimo-properties";
  try {
    const res = await fetch(APIMO_PROXY);
    if (res.ok) {
      const data = await res.json();
      const list = data.properties || data;
      if (Array.isArray(list) && list.length > 0) {
        console.log(`[E&B Immo] Apimo proxy OK: ${list.length} biens`);
        return list.map(normalizeApimo);
      }
    }
  } catch (e) {
    console.warn("[E&B Immo] Apimo proxy failed:", e.message);
  }

  // 2. Try direct Apimo (works if not blocked by CORS)
  if (APIMO_PROVIDER && APIMO_TOKEN && APIMO_AGENCY) {
    const auth = "Basic " + btoa(`${APIMO_PROVIDER}:${APIMO_TOKEN}`);
    const headers = { "Authorization": auth, "Content-Type": "application/json" };
    for (const domain of ["api.apimo.pro", "api3.apimo.com"]) {
      try {
        const res = await fetch(`https://${domain}/agencies/${APIMO_AGENCY}/properties?limit=200`, { headers });
        if (res.ok) {
          const data = await res.json();
          const list = data.properties || data;
          if (Array.isArray(list) && list.length > 0) {
            console.log(`[E&B Immo] Apimo direct OK via ${domain}: ${list.length} biens`);
            return list.map(normalizeApimo);
          }
        }
      } catch (e) { /* skip */ }
    }
  }

  // 3. Fallback to existing API
  try {
    const res = await fetch(FALLBACK_API);
    const data = await res.json();
    console.log(`[E&B Immo] Fallback API: ${data.length} biens`);
    return (Array.isArray(data) ? data : []).map(normalizeFallback);
  } catch (e) {
    console.error("[E&B Immo] Aucune API disponible:", e.message);
    return [];
  }
}

const fmtP = (n) => Number(n).toLocaleString("fr-FR") + " €";

/* ═══ Inline SVG images as data URIs (no network needed) ═══ */
const mkSvg = (w, h, body) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>${body}</svg>`)}`;

/* Modern house — hero */
const HERO_IMG = mkSvg(800, 820, `
  <defs><linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#87CEEB'/><stop offset='.6' stop-color='#B8E4F9'/><stop offset='1' stop-color='#E8F5FE'/></linearGradient>
  <linearGradient id='grass' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#4CAF50'/><stop offset='1' stop-color='#2E7D32'/></linearGradient></defs>
  <rect width='800' height='820' fill='url(#sky)'/>
  <rect y='580' width='800' height='240' fill='url(#grass)'/>
  <rect x='180' y='280' width='440' height='320' rx='4' fill='#F5F0EB'/>
  <rect x='160' y='250' width='480' height='40' fill='#5D4037'/>
  <polygon points='400,140 160,280 640,280' fill='#795548'/>
  <polygon points='400,160 190,280 610,280' fill='#8D6E63'/>
  <rect x='340' y='420' width='120' height='180' rx='4' fill='#5D4037'/>
  <rect x='355' y='435' width='90' height='80' rx='2' fill='#87CEEB' opacity='.6'/>
  <circle cx='445' cy='520' r='6' fill='#FFC107'/>
  <rect x='220' y='330' width='80' height='90' rx='3' fill='#4FC3F7' opacity='.5'/>
  <rect x='220' y='330' width='80' height='90' rx='3' stroke='#F5F0EB' stroke-width='8' fill='none'/>
  <rect x='500' y='330' width='80' height='90' rx='3' fill='#4FC3F7' opacity='.5'/>
  <rect x='500' y='330' width='80' height='90' rx='3' stroke='#F5F0EB' stroke-width='8' fill='none'/>
  <rect x='620' y='350' width='140' height='250' rx='4' fill='#E8E0D8'/>
  <rect x='640' y='380' width='50' height='60' rx='2' fill='#4FC3F7' opacity='.5'/>
  <rect x='710' y='380' width='30' height='60' rx='2' fill='#4FC3F7' opacity='.5'/>
  <rect x='620' y='340' width='140' height='18' fill='#5D4037'/>
  <rect x='50' y='600' width='120' height='100' rx='8' fill='#81C784' opacity='.6'/>
  <circle cx='110' cy='550' r='50' fill='#66BB6A' opacity='.7'/>
  <circle cx='650' cy='540' r='60' fill='#66BB6A' opacity='.5'/>
  <rect x='300' y='610' width='200' height='10' rx='5' fill='#9E9E9E' opacity='.3'/>
`);

/* Family visiting — float thumbnail */
const HERO_FLOAT = mkSvg(400, 500, `
  <defs><linearGradient id='bg' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#FFF8E1'/><stop offset='1' stop-color='#F5F0EB'/></linearGradient></defs>
  <rect width='400' height='500' fill='url(#bg)'/>
  <rect x='40' y='50' width='320' height='300' rx='12' fill='#E8F5E9'/>
  <rect x='80' y='80' width='100' height='130' rx='6' fill='#FFCC80' opacity='.6'/>
  <rect x='220' y='80' width='100' height='130' rx='6' fill='#90CAF9' opacity='.5'/>
  <circle cx='130' cy='300' r='35' fill='#FFB74D'/>
  <rect x='105' y='335' width='50' height='70' rx='8' fill='#42A5F5'/>
  <circle cx='200' cy='290' r='40' fill='#A1887F'/>
  <rect x='172' y='330' width='56' height='80' rx='8' fill='#5C6BC0'/>
  <circle cx='270' cy='310' r='30' fill='#FFB74D'/>
  <rect x='250' y='340' width='40' height='55' rx='6' fill='#EF5350'/>
  <rect x='60' y='400' width='280' height='60' rx='8' fill='#FFF' opacity='.8'/>
  <rect x='80' y='415' width='160' height='12' rx='6' fill='#24AFC5'/>
  <rect x='80' y='435' width='100' height='10' rx='5' fill='#ccc'/>
`);

/* Luxury villa — about */
const ABOUT_IMG = mkSvg(700, 600, `
  <defs><linearGradient id='dusk' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#FF8A65'/><stop offset='.4' stop-color='#FFB74D'/><stop offset='1' stop-color='#FFF8E1'/></linearGradient></defs>
  <rect width='700' height='600' fill='url(#dusk)'/>
  <rect y='400' width='700' height='200' fill='#2E7D32'/>
  <rect x='60' y='350' width='300' height='200' rx='0' fill='#FFF' opacity='.9'/>
  <rect x='340' y='300' width='300' height='250' rx='0' fill='#F5F5F5'/>
  <rect x='60' y='340' width='580' height='16' fill='#795548'/>
  <polygon points='350,180 60,350 640,350' fill='#8D6E63'/>
  <rect x='100' y='380' width='70' height='80' rx='3' fill='#4FC3F7' opacity='.5'/>
  <rect x='200' y='380' width='70' height='80' rx='3' fill='#4FC3F7' opacity='.5'/>
  <rect x='400' y='330' width='60' height='70' rx='3' fill='#4FC3F7' opacity='.4'/>
  <rect x='500' y='330' width='60' height='70' rx='3' fill='#4FC3F7' opacity='.4'/>
  <ellipse cx='350' cy='550' rx='200' ry='20' fill='#1B5E20' opacity='.3'/>
  <rect x='240' y='450' width='120' height='100' rx='60' fill='#4FC3F7' opacity='.3'/>
`);

/* Circular portrait — about float */
const ABOUT_FLOAT = mkSvg(400, 400, `
  <rect width='400' height='400' fill='#E0F2F1'/>
  <circle cx='200' cy='150' r='70' fill='#FFCC80'/>
  <rect x='145' y='220' width='110' height='130' rx='20' fill='#009688'/>
  <rect x='100' y='300' width='200' height='100' rx='12' fill='#00796B'/>
  <circle cx='180' cy='135' r='6' fill='#5D4037'/><circle cx='220' cy='135' r='6' fill='#5D4037'/>
  <path d='M185 160 Q200 175 215 160' stroke='#5D4037' stroke-width='3' fill='none'/>
`);

/* Testimonial portrait */
const TESTI_IMG = mkSvg(600, 630, `
  <defs><linearGradient id='tbg' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#E8F5E9'/><stop offset='1' stop-color='#C8E6C9'/></linearGradient></defs>
  <rect width='600' height='630' rx='12' fill='url(#tbg)'/>
  <circle cx='300' cy='220' r='100' fill='#FFCC80'/>
  <rect x='220' y='320' width='160' height='200' rx='24' fill='#24AFC5'/>
  <rect x='200' y='380' width='200' height='150' rx='16' fill='#1A8A9E'/>
  <circle cx='270' cy='200' r='8' fill='#5D4037'/><circle cx='330' cy='200' r='8' fill='#5D4037'/>
  <path d='M275 235 Q300 260 325 235' stroke='#5D4037' stroke-width='4' fill='none'/>
  <rect x='260' y='140' width='80' height='15' rx='7' fill='#5D4037'/>
  <rect x='100' y='530' width='400' height='12' rx='6' fill='#fff' opacity='.5'/>
  <rect x='150' y='555' width='300' height='10' rx='5' fill='#fff' opacity='.3'/>
`);

/* CTA section image */
const CTA_IMG = mkSvg(700, 850, `
  <defs><linearGradient id='cbg' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#24AFC5' stop-opacity='.15'/><stop offset='1' stop-color='#09261D' stop-opacity='.05'/></linearGradient></defs>
  <rect width='700' height='850' fill='url(#cbg)'/>
  <rect x='80' y='100' width='540' height='400' rx='16' fill='#FFF' opacity='.15'/>
  <rect x='120' y='200' width='200' height='250' rx='8' fill='#FFF' opacity='.1'/>
  <rect x='380' y='180' width='200' height='270' rx='8' fill='#FFF' opacity='.1'/>
  <circle cx='220' cy='160' r='30' fill='#24AFC5' opacity='.3'/>
  <circle cx='480' cy='150' r='25' fill='#24AFC5' opacity='.2'/>
  <rect x='140' y='570' width='420' height='60' rx='30' fill='#24AFC5' opacity='.2'/>
  <rect x='200' y='660' width='300' height='12' rx='6' fill='#FFF' opacity='.1'/>
  <rect x='250' y='690' width='200' height='10' rx='5' fill='#FFF' opacity='.08'/>
  <circle cx='350' cy='400' r='80' fill='none' stroke='#24AFC5' stroke-width='2' opacity='.2'/>
  <path d='M250 380 L350 320 L450 380 L450 480 L250 480Z' fill='#24AFC5' opacity='.12'/>
  <rect x='300' y='420' width='100' height='60' fill='#FFF' opacity='.15'/>
`);

const LOGO = "https://ebimmo.com/wp-content/uploads/2024/05/e_b_logo-removebg-preview-1.png";
const FOOTER_LOGO = LOGO;

/* Unused but kept for reference */
const PROP_IMG1 = HERO_IMG;
const PROP_IMG2 = ABOUT_IMG;
const PROP_IMG3 = HERO_IMG;
const DETAIL_IMG1 = HERO_IMG;
const DETAIL_IMG2 = ABOUT_IMG;

/* Fallback SVG images for property cards if API thumbnails fail */
const FALLBACKS = [
  mkSvg(600,450,`<rect width='600' height='450' fill='#E8F5E9'/><rect x='80' y='120' width='440' height='250' rx='4' fill='#FFF'/><polygon points='300,40 80,150 520,150' fill='#8D6E63'/><rect x='240' y='250' width='120' height='120' rx='4' fill='#795548'/><rect x='120' y='180' width='80' height='80' fill='#4FC3F7' opacity='.4'/><rect x='400' y='180' width='80' height='80' fill='#4FC3F7' opacity='.4'/><text x='300' y='420' text-anchor='middle' font-family='sans-serif' font-size='18' fill='#999'>Maison</text>`),
  mkSvg(600,450,`<rect width='600' height='450' fill='#E3F2FD'/><rect x='50' y='80' width='500' height='300' rx='8' fill='#FFF'/><rect x='80' y='120' width='180' height='120' rx='4' fill='#BBDEFB'/><rect x='320' y='120' width='180' height='120' rx='4' fill='#BBDEFB'/><rect x='80' y='280' width='440' height='60' rx='4' fill='#F5F5F5'/><text x='300' y='420' text-anchor='middle' font-family='sans-serif' font-size='18' fill='#999'>Appartement</text>`),
  mkSvg(600,450,`<defs><linearGradient id='tf' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#C8E6C9'/><stop offset='1' stop-color='#A5D6A7'/></linearGradient></defs><rect width='600' height='450' fill='url(#tf)'/><rect x='100' y='200' width='400' height='200' rx='4' fill='#FFF' opacity='.8'/><polygon points='300,80 100,220 500,220' fill='#795548'/><rect x='230' y='280' width='140' height='120' rx='4' fill='#5D4037'/><circle cx='150' cy='160' r='40' fill='#66BB6A' opacity='.5'/><text x='300' y='430' text-anchor='middle' font-family='sans-serif' font-size='18' fill='#999'>Villa</text>`),
  mkSvg(600,450,`<rect width='600' height='450' fill='#FFF3E0'/><rect x='60' y='100' width='220' height='280' rx='8' fill='#FFF'/><rect x='320' y='100' width='220' height='280' rx='8' fill='#FFF'/><rect x='80' y='130' width='180' height='120' fill='#FFE0B2'/><rect x='340' y='130' width='180' height='120' fill='#FFE0B2'/><rect x='80' y='280' width='180' height='60' rx='4' fill='#F5F5F5'/><rect x='340' y='280' width='180' height='60' rx='4' fill='#F5F5F5'/><text x='300' y='430' text-anchor='middle' font-family='sans-serif' font-size='18' fill='#999'>Bien immobilier</text>`),
  mkSvg(600,450,`<rect width='600' height='450' fill='#ECEFF1'/><rect x='100' y='60' width='400' height='320' rx='12' fill='#FFF'/><rect x='140' y='100' width='320' height='180' rx='8' fill='#B2EBF2'/><path d='M200 200 L300 130 L400 200Z' fill='#00838F' opacity='.5'/><rect x='260' y='200' width='80' height='100' rx='4' fill='#5D4037'/><circle cx='300' cy='310' r='5' fill='#FFC107'/><text x='300' y='420' text-anchor='middle' font-family='sans-serif' font-size='18' fill='#999'>Propriété</text>`),
];
const fb = (i) => FALLBACKS[i % FALLBACKS.length];
const handleImgErr = (e, i) => { e.target.onerror = null; e.target.src = fb(i || 0); };

/* Colors from Figma */
const C = {
  bush: "#09261D",
  cyan: "#24AFC5",
  white: "#FFFFFF",
  abbey: "#56595A",
  mine: "#222222",
  cinder10: "rgba(13,14,19,0.1)",
  cinder15: "rgba(13,14,19,0.15)",
  cinder50: "rgba(13,14,19,0.5)",
  bush15: "rgba(9,38,29,0.15)",
};

/* Reveal animation hook */
function useRv(th = 0.1) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: th });
    o.observe(el);
    return () => o.disconnect();
  }, [th]);
  return [ref, v];
}

function Rv({ children, d = 0, style = {} }) {
  const [ref, v] = useRv();
  return (
    <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(30px)", transition: `all .7s cubic-bezier(.22,1,.36,1) ${d * .1}s`, ...style }}>
      {children}
    </div>
  );
}

/* Pill button matching Figma Component 2 */
function PillBtn({ children, variant = "outline-cyan", onClick, style: s = {} }) {
  const [h, setH] = useState(false);
  const styles = {
    "outline-white": { border: `1px solid ${C.white}`, color: C.white, bg: "transparent", hBg: "rgba(255,255,255,.1)" },
    "outline-cyan": { border: `1px solid ${C.cyan}`, color: C.cyan, bg: "transparent", hBg: "rgba(36,175,197,.08)" },
    "solid-cyan": { border: `1px solid ${C.cyan}`, color: C.white, bg: C.cyan, hBg: "#1d9ab0" },
  };
  const st = styles[variant];
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "12px 31px", borderRadius: 99, border: st.border, background: h ? st.hBg : st.bg, color: st.color, fontFamily: "Urbanist, sans-serif", fontWeight: 500, fontSize: 18, cursor: "pointer", transition: "all .3s", lineHeight: "27.9px", whiteSpace: "nowrap", ...s }}>
      {children}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </button>
  );
}

/* Search button */
function SearchBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 30px", borderRadius: 99, background: C.cyan, border: "none", color: C.white, fontFamily: "Urbanist, sans-serif", fontWeight: 700, fontSize: 18, cursor: "pointer", lineHeight: "27.9px" }}>
      Recherche
    </button>
  );
}

/* Property card for grid */
function PropCard({ p, onClick, idx = 0 }) {
  const area = p.area?.value || p.area?.total || "—";
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ cursor: "pointer", transition: "transform .4s cubic-bezier(.22,1,.36,1)", transform: h ? "translateY(-6px)" : "" }}>
      <div style={{ width: "100%", aspectRatio: "407/305", borderRadius: 12, overflow: "hidden", background: "#eee" }}>
        <img src={p.thumbnail || fb(idx)} alt={p.title} onError={(e) => handleImgErr(e, idx)} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s", transform: h ? "scale(1.05)" : "" }} />
      </div>
      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <h3 style={{ fontSize: 24, fontWeight: 500, color: C.bush, lineHeight: "28.8px", margin: 0, maxWidth: "60%" }}>{p.title}</h3>
          <span style={{ fontSize: 24, fontWeight: 500, color: C.bush, lineHeight: "32.16px", whiteSpace: "nowrap" }}>{fmtP(p.price)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 400, color: C.abbey, lineHeight: "27.9px" }}>{p.city || "Normandie"}</span>
          <span style={{ fontSize: 18, fontWeight: 400, color: C.abbey, lineHeight: "27.9px" }}>{area} m²</span>
        </div>
      </div>
    </div>
  );
}

/* Property row for detailed list */
function PropRow({ p, onClick, idx = 0 }) {
  const area = p.area?.value || p.area?.total || "—";
  const [h, setH] = useState(false);
  const desc = p.description || `${p.title} - Surface ${area}m² - ${p.rooms || 0} pièces - ${p.bedrooms || 0} chambres. Contactez-nous pour plus d'informations : Emeline BUREL 0760953618 contact@eb-immo.fr`;
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", gap: 30, paddingBottom: 61, borderBottom: `1px solid ${C.cinder50}`, cursor: "pointer" }}>
      <div style={{ flex: "0 0 625px", borderRadius: 16, overflow: "hidden", height: 440 }}>
        <img src={p.thumbnail || fb(idx)} alt={p.title} onError={(e) => handleImgErr(e, idx)} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s", transform: h ? "scale(1.04)" : "" }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ fontSize: 52, fontWeight: 500, color: C.bush, lineHeight: "62.4px", marginBottom: 20 }}>{p.title}</h3>
          <p style={{ fontSize: 18, fontWeight: 400, color: C.abbey, lineHeight: "27.9px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 8, WebkitBoxOrient: "vertical" }}>{desc}</p>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
          <span style={{ fontSize: 40, fontWeight: 500, color: C.bush, lineHeight: "52px" }}>{fmtP(p.price)}</span>
        </div>
      </div>
    </div>
  );
}

/* FAQ Accordion */
function FaqItem({ q, a, idx }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.bush15}` }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "40px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: 30, fontWeight: 500, color: C.mine, lineHeight: "37.5px" }}>{idx}. {q}</span>
        <div style={{ marginTop: 10, position: "relative", width: 22, height: 22, flexShrink: 0 }}>
          <div style={{ position: "absolute", top: "50%", left: 0, width: 22, height: 1.5, background: C.cyan, transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", top: 0, left: "50%", width: 1.5, height: 22, background: C.cyan, transform: `translateX(-50%) ${open ? "scaleY(0)" : "scaleY(1)"}`, transition: "transform .3s" }} />
        </div>
      </button>
      <div style={{ maxHeight: open ? 300 : 0, overflow: "hidden", transition: "max-height .4s cubic-bezier(.22,1,.36,1)" }}>
        <p style={{ fontSize: 18, fontWeight: 400, color: C.abbey, lineHeight: "27.9px", padding: "0 0 30px" }}>{a}</p>
      </div>
    </div>
  );
}

/* ═══════ MAIN APP ═══════ */
export default function App() {
  const [props, setProps] = useState([]);
  const [ld, setLd] = useState(true);
  const [pg, setPg] = useState("home");
  const [sid, setSid] = useState(null);

  useEffect(() => {
    fetchProperties()
      .then(d => { setProps(d); setLd(false); })
      .catch(() => setLd(false));
  }, []);

  const go = useCallback((p, id) => {
    setPg(p);
    if (id !== undefined) setSid(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div style={{ fontFamily: "Urbanist, sans-serif", color: C.bush, background: C.white, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{height:4px;width:4px}
        ::-webkit-scrollbar-thumb{background:${C.cyan};border-radius:2px}
        ::selection{background:${C.cyan};color:${C.white}}
        img{display:block}
      `}</style>

      {/* ═══ NAV ═══ */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, padding: "14px 80px", display: "flex", alignItems: "center", justifyContent: "space-between", background: pg === "home" ? "transparent" : "rgba(9,38,29,.97)", backdropFilter: "blur(12px)", transition: "background .3s" }}>
        <img src={LOGO} alt="E&B Immo" style={{ height: 67, cursor: "pointer", filter: "brightness(10)" }} onClick={() => go("home")} />
        <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
          {[["Accueil", "home"], ["Propriétés", "annonces"], ["Nous contacter", "contact"]].map(([l, p]) => (
            <a key={p} onClick={() => go(p)} style={{ fontSize: 18, fontWeight: 400, color: C.white, cursor: "pointer", lineHeight: "27.9px", textDecoration: "none", opacity: pg === p ? 1 : .7, transition: "opacity .2s" }}>{l}</a>
          ))}
          <PillBtn variant="outline-white" onClick={() => go("contact")} style={{ padding: "11px 31px" }}>Prendre contact</PillBtn>
        </div>
      </nav>

      {pg === "home" && <Home props={props} ld={ld} go={go} />}
      {pg === "annonces" && <Annonces props={props} ld={ld} go={go} />}
      {pg === "bien" && <Bien props={props} id={sid} go={go} />}
      {pg === "contact" && <Contact go={go} />}
    </div>
  );
}

/* ═══════ HOME ═══════ */
function Home({ props, ld, go }) {
  const featured = props.slice(0, 3);
  const listed = props.slice(0, 3);

  return (
    <main>
      {/* HERO — Figma node 1:365 + 1:389 */}
      <section style={{ background: C.bush, padding: "148px 80px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 40, alignItems: "stretch" }}>
          {/* Left: heading + CTA */}
          <div style={{ flex: "0 0 auto", minWidth: 715, display: "flex", flexDirection: "column", gap: 60, justifyContent: "flex-end" }}>
            <Rv>
              <h1 style={{ fontSize: 87, fontWeight: 500, color: C.white, lineHeight: "95.7px", margin: 0 }}>
                Agence<br/>immobilière<br/>digitale<br/>De la côte fleurie
              </h1>
            </Rv>
            <Rv d={2}>
              <PillBtn variant="outline-white" onClick={() => go("annonces")}>Commencer à découvrir</PillBtn>
            </Rv>
          </div>

          {/* Right: Hero image with dome clip + floating thumbnail — Figma 1:389 */}
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "flex-end", position: "relative" }}>
            <Rv d={3}>
              <div style={{ position: "relative", width: 525, flexShrink: 0 }}>
                {/* Main hero image clipped as arch/dome (flat bottom, rounded top) */}
                <div style={{
                  width: 525,
                  height: 538,
                  borderRadius: "50% 50% 0 0 / 48% 48% 0 0",
                  overflow: "hidden",
                  position: "relative",
                }}>
                  <img src={HERO_IMG} alt="Maison moderne" style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }} />
                </div>

                {/* Floating thumbnail — Figma 1:392 */}
                <div style={{
                  position: "absolute",
                  bottom: 40,
                  left: -65,
                  width: 186,
                  height: 232,
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 8px 32px rgba(0,0,0,.25)",
                  zIndex: 2,
                }}>
                  <img src={HERO_FLOAT} alt="Famille avec agent" style={{
                    width: "100%",
                    height: "142%",
                    objectFit: "cover",
                    objectPosition: "center top",
                    marginTop: "-21%",
                  }} />
                </div>
              </div>
            </Rv>
          </div>
        </div>
      </section>

      {/* SEARCH BAR */}
      <section style={{ background: `linear-gradient(to bottom, ${C.bush} 50%, ${C.white} 50%)`, padding: "0 80px" }}>
        <Rv>
          <div style={{ background: C.white, border: `1px solid ${C.cinder15}`, borderRadius: 16, padding: 41, display: "flex", gap: 24, boxShadow: "4px 4px 4px rgba(0,0,0,.05)", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 400px", position: "relative" }}>
              <div style={{ border: `1px solid ${C.cinder10}`, borderRadius: 99, height: 76, display: "flex", alignItems: "center", padding: "0 20px 0 52px" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ position: "absolute", left: 20 }}><path d="M9 17A8 8 0 109 1a8 8 0 000 16zM19 19l-4.35-4.35" stroke={C.abbey} strokeWidth="1.5" strokeLinecap="round"/></svg>
                <input placeholder="Recherche de biens immobiliers" style={{ flex: 1, border: "none", outline: "none", fontFamily: "Urbanist, sans-serif", fontSize: 18, color: C.mine, background: "transparent" }} />
              </div>
              <div style={{ position: "absolute", right: 12, top: 12, bottom: 12 }}>
                <SearchBtn onClick={() => go("annonces")} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 24, flex: "0 0 600px" }}>
              {["Propriétés", "Localisation", "Types"].map((l, i) => (
                <div key={i} style={{ flex: 1, border: `1px solid ${C.cinder10}`, borderRadius: 99, height: 76, display: "flex", alignItems: "center", padding: "0 16px 0 20px", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 18, fontWeight: 500, color: C.mine }}>{l}</span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ opacity: .5 }}><path d="M4 7l5 5 5-5" stroke={C.mine} strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              ))}
            </div>
          </div>
        </Rv>
      </section>

      {/* NOUVELLES ANNONCES */}
      <section style={{ padding: "150px 80px 0", maxWidth: 1440, margin: "0 auto" }}>
        <Rv>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 60 }}>
            <h2 style={{ fontSize: 70, fontWeight: 500, color: C.bush, lineHeight: "79.8px" }}>Nouvelles annonces</h2>
            <PillBtn variant="outline-cyan" onClick={() => go("annonces")}>Tout découvrir</PillBtn>
          </div>
        </Rv>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30 }}>
          {!ld && featured.map((p, i) => (
            <Rv key={p.id} d={i + 1}>
              <PropCard p={p} idx={i} onClick={() => go("bien", p.id)} />
            </Rv>
          ))}
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section style={{ background: C.bush, padding: "150px 80px", marginTop: 150 }}>
        <div style={{ display: "flex", gap: 144, maxWidth: 1280, margin: "0 auto" }}>
          <Rv>
            <div style={{ position: "relative", width: 512, flexShrink: 0 }}>
              <img src={ABOUT_IMG} alt="About" style={{ width: "100%", borderRadius: 12 }} />
              <div style={{ position: "absolute", bottom: "-17%", right: "-12%", width: 282, height: 282, borderRadius: "50%", overflow: "hidden" }}>
                <img src={ABOUT_FLOAT} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
          </Rv>
          <Rv d={2}>
            <div style={{ color: C.white }}>
              <span style={{ fontSize: 24, fontWeight: 400, lineHeight: "31.92px", display: "block", marginBottom: 15 }}>Explorer tout</span>
              <h2 style={{ fontSize: 52, fontWeight: 500, lineHeight: "62.4px", marginBottom: 15 }}>L'Évolution d'une Passion Immobilière</h2>
              <p style={{ fontSize: 18, fontWeight: 400, lineHeight: "27.9px", opacity: .85, marginBottom: 40 }}>
                Depuis 7 ans, je vous accompagne dans tous vos projets immobiliers avec professionnalisme et passion. Après avoir acquis une précieuse expérience en travaillant dans une agence caennaise, j'ai décidé de créer ma propre agence en m'associant avec Benjamin.
              </p>
              {[
                { t: "Votre partenaire immobilier dévoué", d: "Que vous souhaitiez vendre, acheter ou louer un bien immobilier, notre équipe dévouée est là pour vous conseiller et vous guider à chaque étape de votre démarche.", icon: "M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" },
                { t: "Répondre à vos besoins immobiliers avec précision", d: "Grâce à notre connaissance approfondie du marché et à notre réseau étendu, nous sommes en mesure de vous proposer des solutions adaptées à vos besoins et à vos attentes.", icon: "M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5" },
                { t: "Votre projet, notre engagement", d: "Chez Emeline et Benjamin Immo, nous comprenons que chaque projet est unique. C'est pourquoi nous nous engageons à vous fournir un accompagnement sur-mesure.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 40 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(36,175,197,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d={item.icon} stroke={C.cyan} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 30, fontWeight: 500, lineHeight: "36px", marginBottom: 11 }}>{item.t}</h4>
                    <p style={{ fontSize: 18, fontWeight: 400, lineHeight: "27.9px", opacity: .8 }}>{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Rv>
        </div>
      </section>

      {/* LISTE DES NOUVEAUTÉS */}
      <section style={{ padding: "150px 80px 0", maxWidth: 1440, margin: "0 auto" }}>
        <Rv>
          <h2 style={{ fontSize: 70, fontWeight: 500, color: C.bush, lineHeight: "79.8px", marginBottom: 60 }}>Liste des nouveautés</h2>
        </Rv>
        <div style={{ display: "flex", flexDirection: "column", gap: 60 }}>
          {!ld && listed.map((p, i) => (
            <Rv key={p.id} d={i}>
              <PropRow p={p} idx={i + 3} onClick={() => go("bien", p.id)} />
            </Rv>
          ))}
        </div>
        <Rv d={1} style={{ textAlign: "center", marginTop: 60 }}>
          <PillBtn variant="outline-cyan" onClick={() => go("annonces")}>Explorer toutes les propriétés</PillBtn>
        </Rv>
      </section>

      {/* TÉMOIGNAGES */}
      <section style={{ background: C.bush, padding: "120px 80px", marginTop: 150 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Rv>
            <h2 style={{ fontSize: 70, fontWeight: 500, color: C.white, lineHeight: "79.8px", marginBottom: 60 }}>Témoignages</h2>
          </Rv>
          <Rv d={1}>
            <div style={{ display: "flex", gap: 60 }}>
              <div style={{ flex: 1, padding: "0 10px" }}>
                <blockquote style={{ fontSize: 30, fontWeight: 400, color: C.white, lineHeight: "39px", margin: 0, marginBottom: 60 }}>
                  "Nous vous recommandons vivement !!! Benjamin et Émeline ont réussi à trouver notre coup de coeur malgré nos contraintes. Merci à vous deux !!"
                </blockquote>
                <div>
                  <h4 style={{ fontSize: 24, fontWeight: 500, color: C.white, lineHeight: "32.16px", marginBottom: 0 }}>Patricia DENIS</h4>
                  <span style={{ fontSize: 18, fontWeight: 400, color: C.white, opacity: .7 }}>⭐ 5/5 Google Avis</span>
                </div>
              </div>
              <div style={{ flex: "0 0 438px" }}>
                <img src={TESTI_IMG} alt="Témoignage" style={{ width: "100%", borderRadius: 12 }} />
              </div>
            </div>
          </Rv>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "150px 0", maxWidth: 1064, margin: "0 auto" }}>
        <Rv>
          <h2 style={{ fontSize: 70, fontWeight: 500, color: C.bush, lineHeight: "79.8px", textAlign: "center", marginBottom: 60 }}>
            Questions<br/>fréquemment posées
          </h2>
        </Rv>
        <Rv d={1}>
          <div>
            <FaqItem idx={1} q="Qui sommes-nous ?" a="E&B Immo est une agence immobilière créée par Emeline Burel et Benjamin, fondée sur 7 ans d'expérience dans l'immobilier. Nous accompagnons nos clients dans leurs projets d'achat, vente et location de biens immobiliers en Normandie et au-delà." />
            <FaqItem idx={2} q="Comment puis-je prendre rendez-vous avec un conseiller immobilier ?" a="Vous pouvez nous contacter directement par téléphone au +33 7 60 95 36 18 ou par email à contact@eb-immo.fr. Nous vous répondrons dans les plus brefs délais pour fixer un rendez-vous." />
            <FaqItem idx={3} q="Quelle est la zone géographique couverte par EB Immo ?" a="Nous couvrons principalement la côte fleurie, le Calvados et la Normandie. Nous avons également des biens en Corse et en région parisienne. N'hésitez pas à nous contacter pour toute demande spécifique." />
          </div>
        </Rv>
      </section>

      {/* CTA */}
      <section style={{ background: C.bush, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 80, maxWidth: 1440, margin: "0 auto", padding: "0 80px" }}>
          <Rv>
            <div style={{ width: 579, flexShrink: 0 }}>
              <img src={CTA_IMG} alt="CTA" style={{ width: "100%", height: "auto" }} />
            </div>
          </Rv>
          <Rv d={2} style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "150px 0" }}>
            <h2 style={{ fontSize: 70, fontWeight: 500, color: C.white, lineHeight: "79.8px", marginBottom: 40 }}>
              Vous cherchez à acheter ou à louer un bien immobilier ?
            </h2>
            <PillBtn variant="outline-white" onClick={() => go("contact")}>Prendre contact</PillBtn>
          </Rv>
        </div>
      </section>

      <Footer go={go} />
    </main>
  );
}

/* ═══════ ANNONCES ═══════ */
function Annonces({ props, ld, go }) {
  const [f, setF] = useState("all");
  const [s, setS] = useState("");
  const fl = props.filter(x => {
    const txt = `${x.title} ${x.type || ""}`.toLowerCase();
    if (f === "maison" && !/maison|villa|house/i.test(txt)) return false;
    if (f === "appart" && !/appart|studio|duplex|flat/i.test(txt)) return false;
    if (f === "terrain" && !/terrain|land/i.test(txt)) return false;
    if (s && !txt.includes(s.toLowerCase()) && !(x.city || "").toLowerCase().includes(s.toLowerCase())) return false;
    return true;
  });

  return (
    <main style={{ paddingTop: 120 }}>
      <section style={{ padding: "60px 80px 120px", maxWidth: 1440, margin: "0 auto" }}>
        <Rv><h1 style={{ fontSize: 70, fontWeight: 500, color: C.bush, lineHeight: "79.8px", marginBottom: 10 }}>Nos propriétés</h1>
          <span style={{ fontSize: 18, color: C.abbey, display: "block", marginBottom: 40 }}>{ld ? "Chargement..." : `${fl.length} bien${fl.length > 1 ? "s" : ""} trouvé${fl.length > 1 ? "s" : ""}`}</span>
        </Rv>
        <Rv d={1}>
          <div style={{ display: "flex", gap: 12, marginBottom: 40, flexWrap: "wrap", alignItems: "center" }}>
            {[["all", "Tous"], ["maison", "Maisons"], ["appart", "Appartements"], ["terrain", "Terrains"]].map(([k, l]) => (
              <button key={k} onClick={() => setF(k)} style={{ padding: "10px 28px", borderRadius: 99, border: `1px solid ${f === k ? C.cyan : C.cinder10}`, background: f === k ? C.cyan : "transparent", color: f === k ? C.white : C.mine, fontFamily: "Urbanist, sans-serif", fontSize: 16, fontWeight: 500, cursor: "pointer", transition: "all .2s" }}>{l}</button>
            ))}
            <input placeholder="Rechercher..." value={s} onChange={e => setS(e.target.value)} style={{ marginLeft: "auto", padding: "10px 24px", border: `1px solid ${C.cinder10}`, borderRadius: 99, fontFamily: "Urbanist, sans-serif", fontSize: 16, outline: "none", width: 300, background: "transparent" }} />
          </div>
        </Rv>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 30 }}>
          {!ld && fl.map((p, i) => (
            <Rv key={p.id} d={Math.min(i % 3 + 1, 3)}>
              <PropCard p={p} idx={i} onClick={() => go("bien", p.id)} />
            </Rv>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a onClick={() => go("home")} style={{ fontSize: 18, fontWeight: 400, color: C.abbey, cursor: "pointer", textDecoration: "underline" }}>← Retour à l'accueil</a>
        </div>
      </section>
      <Footer go={go} />
    </main>
  );
}

/* ═══════ BIEN ═══════ */
function Bien({ props, id, go }) {
  const p = props.find(x => x.id === id);
  const [photoIdx, setPhotoIdx] = useState(0);
  if (!p) return <div style={{ padding: 200, textAlign: "center", fontSize: 24 }}>Bien non trouvé</div>;
  const area = p.area?.value || p.area?.total || "—";
  const photos = p.photos?.length ? p.photos : [p.thumbnail || fb(0)];

  return (
    <main style={{ paddingTop: 120 }}>
      <section style={{ padding: "40px 80px 120px", maxWidth: 1440, margin: "0 auto" }}>
        <a onClick={() => go("annonces")} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 18, fontWeight: 400, color: C.cyan, cursor: "pointer", marginBottom: 40, textDecoration: "none" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={C.cyan} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Retour aux propriétés
        </a>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, alignItems: "start" }}>
          <div>
            {/* Main photo */}
            <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 12 }}>
              <img src={photos[photoIdx] || fb(0)} alt={p.title} onError={(e) => handleImgErr(e, 0)} style={{ width: "100%", height: 520, objectFit: "cover" }} />
            </div>
            {/* Thumbnails if multiple photos */}
            {photos.length > 1 && (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {photos.slice(0, 8).map((ph, i) => (
                  <div key={i} onClick={() => setPhotoIdx(i)} style={{ flex: "0 0 100px", height: 70, borderRadius: 8, overflow: "hidden", cursor: "pointer", border: photoIdx === i ? `2px solid ${C.cyan}` : "2px solid transparent", transition: "border .2s" }}>
                    <img src={ph} alt="" onError={(e) => handleImgErr(e, i)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
            {/* Description from Apimo */}
            {p.description && (
              <div style={{ marginTop: 40 }}>
                <h3 style={{ fontSize: 24, fontWeight: 500, color: C.bush, marginBottom: 16 }}>Description</h3>
                <p style={{ fontSize: 18, fontWeight: 400, color: C.abbey, lineHeight: "27.9px" }}>{p.description}</p>
              </div>
            )}
          </div>
          <div style={{ position: "sticky", top: 120 }}>
            {p.category && <span style={{ fontSize: 14, fontWeight: 600, color: C.cyan, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>{p.category}</span>}
            <h1 style={{ fontSize: 52, fontWeight: 500, color: C.bush, lineHeight: "62.4px", marginBottom: 8 }}>{p.title}</h1>
            {p.city && <div style={{ fontSize: 18, fontWeight: 400, color: C.abbey, marginBottom: 20 }}>{p.city}{p.zipcode ? ` (${p.zipcode})` : ""}</div>}
            <div style={{ fontSize: 40, fontWeight: 500, color: C.bush, marginBottom: 40 }}>{fmtP(p.price)}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 40 }}>
              {[["Surface", `${area} m²`], ["Pièces", p.rooms || "—"], ["Chambres", p.bedrooms || "—"], ["Référence", p.reference], ...(p.type ? [["Type", p.type]] : [])].map(([l, v], i) => (
                <div key={i} style={{ background: "#f5f5f5", borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ fontSize: 14, fontWeight: 400, color: C.abbey, marginBottom: 6 }}>{l}</div>
                  <div style={{ fontSize: 24, fontWeight: 500, color: C.bush }}>{v}</div>
                </div>
              ))}
            </div>
            <PillBtn variant="solid-cyan" onClick={() => go("contact")} style={{ width: "100%", justifyContent: "center" }}>Nous contacter</PillBtn>
            {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", marginTop: 16, fontSize: 16, fontWeight: 400, color: C.abbey, textDecoration: "underline" }}>Voir l'annonce complète</a>}
          </div>
        </div>
      </section>
      <Footer go={go} />
    </main>
  );
}

/* ═══════ CONTACT ═══════ */
function Contact({ go }) {
  return (
    <main style={{ paddingTop: 120 }}>
      <section style={{ padding: "60px 80px 120px", maxWidth: 1280, margin: "0 auto" }}>
        <Rv><h1 style={{ fontSize: 70, fontWeight: 500, color: C.bush, lineHeight: "79.8px", marginBottom: 60 }}>Nous contacter</h1></Rv>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <Rv d={1}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 400, color: C.abbey, lineHeight: "27.9px", marginBottom: 48 }}>
                Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner dans votre projet immobilier.
              </p>
              {[["📞", "+33 7 60 95 36 18"], ["✉️", "contact@eb-immo.fr"], ["📍", "1 rue Jacques Pasquier, 14390 Petiville"]].map(([ic, v], i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{ic}</div>
                  <span style={{ fontSize: 18, fontWeight: 500, color: C.abbey }}>{v}</span>
                </div>
              ))}
            </div>
          </Rv>
          <Rv d={2}>
            <div style={{ background: "#f5f5f5", borderRadius: 16, padding: 48 }}>
              <h3 style={{ fontSize: 30, fontWeight: 500, marginBottom: 24 }}>Envoyez-nous un message</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <input placeholder="Nom" style={iS} />
                  <input placeholder="Prénom" style={iS} />
                </div>
                <input placeholder="Email" type="email" style={iS} />
                <input placeholder="Téléphone" type="tel" style={iS} />
                <textarea placeholder="Votre message..." rows={4} style={{ ...iS, resize: "vertical" }} />
                <PillBtn variant="solid-cyan" onClick={() => {}} style={{ width: "100%", justifyContent: "center" }}>Envoyer</PillBtn>
              </div>
            </div>
          </Rv>
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a onClick={() => go("home")} style={{ fontSize: 18, fontWeight: 400, color: C.abbey, cursor: "pointer", textDecoration: "underline" }}>← Retour à l'accueil</a>
        </div>
      </section>
      <Footer go={go} />
    </main>
  );
}

const iS = { width: "100%", padding: "16px 20px", border: `1px solid ${C.cinder10}`, borderRadius: 12, fontFamily: "Urbanist, sans-serif", fontSize: 18, outline: "none", background: C.white };

/* ═══════ FOOTER ═══════ */
function Footer({ go }) {
  return (
    <footer style={{ padding: "100px 80px 30px", maxWidth: 1440, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 144, marginBottom: 60 }}>
        <div style={{ maxWidth: 330, flexShrink: 0 }}>
          <img src={FOOTER_LOGO} alt="E&B Immo" style={{ width: 120, marginBottom: 23 }} />
          <p style={{ fontSize: 18, fontWeight: 400, color: C.bush, lineHeight: "27.9px", marginBottom: 24 }}>
            Votre partenaire de confiance pour tous vos besoins immobiliers. Avec notre expertise, notre engagement et notre service personnalisé, nous vous accompagnons à chaque étape de votre projet.
          </p>
          <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
            {["facebook", "instagram", "linkedin", "twitter"].map((s, i) => (
              <div key={i} style={{ width: 24, height: 24, borderRadius: 12, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.abbey, opacity: .3 }} />
              </div>
            ))}
          </div>
          <PillBtn variant="outline-cyan" onClick={() => go("contact")} style={{ fontSize: 16, padding: "10px 28px" }}>Prendre contact</PillBtn>
        </div>
        <div style={{ display: "flex", gap: 80, flex: 1 }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: 18, fontWeight: 500, color: C.bush, lineHeight: "20.52px", marginBottom: 16 }}>Pages</h4>
            {["Accueil", "Propriétés", "Prendre Contact"].map((l, i) => (
              <a key={i} onClick={() => go(["home", "annonces", "contact"][i])} style={{ display: "block", fontSize: 18, fontWeight: 500, color: C.abbey, lineHeight: "27.9px", cursor: "pointer", marginBottom: 11 }}>{l}</a>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: 18, fontWeight: 500, color: C.bush, lineHeight: "20.52px", marginBottom: 16 }}>Contact</h4>
            <span style={{ display: "block", fontSize: 18, fontWeight: 500, color: C.abbey, lineHeight: "27.9px", marginBottom: 11 }}>+33 7 60 95 36 18</span>
            <span style={{ display: "block", fontSize: 18, fontWeight: 500, color: C.abbey, lineHeight: "27.9px", marginBottom: 11 }}>contact@eb-immo.fr</span>
            <span style={{ display: "block", fontSize: 18, fontWeight: 500, color: C.abbey, lineHeight: "27.9px" }}>1 rue Jacques Pasquier<br/>14390 Petiville</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: `1px solid rgba(86,89,90,.5)`, paddingTop: 31, paddingBottom: 30, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 18, fontWeight: 400, color: C.bush }}>© All rights reserved. E&B Immo</span>
        <span style={{ fontSize: 18, fontWeight: 400, color: C.bush }}>2025</span>
      </div>
    </footer>
  );
}
