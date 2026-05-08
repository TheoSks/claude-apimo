"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ═══ APIMO API CONFIG ═══ */
const APIMO_PROVIDER = "4019";
const APIMO_TOKEN = "5ccdef5377bd6f2f41681f17233c7818a3484333";
const APIMO_AGENCY = "23650";
const FALLBACK_API = "https://tst-drab-eta.vercel.app/api/properties";

/* Format title like ebimmo.com: "MAISON DE VILLE A RENOVER – 63M² – BIEVILLE-BEUVILLE" */
function fmtTitle(p) {
  const type = (p.type?.name || p.subtype?.name || "Bien").toUpperCase();
  const area = p.area?.value || p.area?.total || 0;
  const areaStr = area ? `${area}M²` : "";
  const city = (p.city?.name || "").toUpperCase();
  return [type, areaStr, city].filter(Boolean).join(" – ");
}

/* Use Apimo raw description, or auto-generate an E&B Immo style one */
function fmtDesc(p) {
  const raw = (p.comments || []).map(c => c.comment).filter(Boolean).join("\n\n");
  if (raw && raw.length > 30) return raw;
  const type = (p.type?.name || p.subtype?.name || "bien").toLowerCase();
  const rooms = p.rooms || 0;
  const beds = p.bedrooms || 0;
  const area = p.area?.value || p.area?.total || 0;
  const city = p.city?.name || "Normandie";
  const zip = p.city?.zipcode || "";
  const isFem = type === "maison" || type === "villa" || type.endsWith("e");
  const lines = [];
  lines.push(`NOUVEAUTÉ CHEZ E&B IMMO`);
  if (area > 0) {
    lines.push(`Sur la commune de ${city.toUpperCase()}${zip ? ` (${zip})` : ""}, nous vous proposons de découvrir ${isFem ? "cette" : "ce"} ${type} de ${area}m²${rooms ? ` comprenant ${rooms} pièce${rooms > 1 ? "s" : ""}` : ""}${beds ? ` dont ${beds} chambre${beds > 1 ? "s" : ""}` : ""}.`);
  } else {
    lines.push(`${type.charAt(0).toUpperCase() + type.slice(1)} situé${isFem ? "e" : ""} à ${city}${zip ? ` (${zip})` : ""}.`);
  }
  if (p.area?.total && p.area.total > area) lines.push(`Terrain de ${p.area.total} m².`);
  lines.push(`Pour plus d'informations ou organiser une visite :\nEmeline BUREL\n07 60 95 36 18\ncontact@eb-immo.fr`);
  return lines.join("\n\n");
}

function normalizeApimo(p) {
  const photos = (p.pictures || []).map(pic => pic.url).filter(Boolean);
  return {
    id: p.id, title: p.name || fmtTitle(p),
    displayTitle: fmtTitle(p),
    price: p.price?.value || 0, rooms: p.rooms || 0, bedrooms: p.bedrooms || 0,
    area: { value: p.area?.value || 0, total: p.area?.total || 0 },
    city: p.city?.name || "", zipcode: p.city?.zipcode || "", reference: p.reference || "",
    thumbnail: photos[0] || "", photos, url: p.url || "",
    description: fmtDesc(p),
    category: p.category?.name || "", type: p.type?.name || "", subtype: p.subtype?.name || "",
    address: p.publish_address ? p.address : "",
    latitude: p.latitude, longitude: p.longitude, _raw: p,
  };
}
function normalizeFallback(p) {
  const area = p.area?.value || p.area?.total || 0;
  const rooms = p.rooms || 0;
  const beds = p.bedrooms || 0;
  const type = /maison|villa/i.test(p.title) ? "MAISON" : /appart/i.test(p.title) ? "APPARTEMENT" : /terrain/i.test(p.title) ? "TERRAIN" : "BIEN";
  const city = (p.city || "").toUpperCase();
  const displayTitle = [type, area ? `${area}M²` : "", city].filter(Boolean).join(" – ");
  const isFem = type === "MAISON" || type === "VILLA";
  const desc = area > 0
    ? `NOUVEAUTÉ CHEZ E&B IMMO\n\nNous vous proposons de découvrir ${isFem ? "cette" : "ce"} ${type.toLowerCase()} de ${area}m²${rooms ? ` comprenant ${rooms} pièces` : ""}${beds ? ` dont ${beds} chambres` : ""}.\n\nPour plus d'informations ou organiser une visite :\nEmeline BUREL\n07 60 95 36 18\ncontact@eb-immo.fr`
    : `${type.charAt(0) + type.slice(1).toLowerCase()} disponible.\n\nContactez E&B Immo pour plus d'informations.`;
  return { ...p, displayTitle, city: p.city || "", photos: p.thumbnail ? [p.thumbnail] : [], description: desc, category: "", type: type.charAt(0) + type.slice(1).toLowerCase(), subtype: "", address: "", _raw: p };
}

async function fetchProperties() {
  const APIMO_PROXY = "/api/apimo-properties";
  try {
    const res = await fetch(APIMO_PROXY);
    if (res.ok) { const data = await res.json(); const list = data.properties || data; if (Array.isArray(list) && list.length > 0) return list.map(normalizeApimo); }
  } catch (e) { /* skip */ }
  if (APIMO_PROVIDER && APIMO_TOKEN && APIMO_AGENCY) {
    const auth = "Basic " + btoa(`${APIMO_PROVIDER}:${APIMO_TOKEN}`);
    const headers = { Authorization: auth, "Content-Type": "application/json" };
    for (const domain of ["api.apimo.pro", "api3.apimo.com"]) {
      try { const res = await fetch(`https://${domain}/agencies/${APIMO_AGENCY}/properties?limit=200`, { headers }); if (res.ok) { const data = await res.json(); const list = data.properties || data; if (Array.isArray(list) && list.length > 0) return list.map(normalizeApimo); } } catch (e) { /* skip */ }
    }
  }
  try { const res = await fetch(FALLBACK_API); const data = await res.json(); return (Array.isArray(data) ? data : []).map(normalizeFallback); } catch (e) { return []; }
}

const fmtP = (n) => Number(n).toLocaleString("fr-FR") + " €";

/* ═══ Responsive hook ═══ */
function useMedia() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const h = () => setW(window.innerWidth); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return { mob: w < 768, tab: w >= 768 && w < 1024, desk: w >= 1024, w };
}

/* ═══ Images (inline SVG data URIs) ═══ */
const mkSvg = (w, h, body) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>${body}</svg>`)}`;
const HERO_IMG = mkSvg(800,820,`<defs><linearGradient id='sky' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#87CEEB'/><stop offset='1' stop-color='#E8F5FE'/></linearGradient></defs><rect width='800' height='820' fill='url(#sky)'/><rect y='580' width='800' height='240' fill='#2E7D32'/><rect x='180' y='280' width='440' height='320' rx='4' fill='#F5F0EB'/><polygon points='400,140 160,280 640,280' fill='#8D6E63'/><rect x='340' y='420' width='120' height='180' rx='4' fill='#5D4037'/><rect x='220' y='330' width='80' height='90' rx='3' fill='#4FC3F7' opacity='.5'/><rect x='500' y='330' width='80' height='90' rx='3' fill='#4FC3F7' opacity='.5'/><circle cx='110' cy='550' r='50' fill='#66BB6A' opacity='.7'/>`);
const HERO_FLOAT = mkSvg(400,500,`<rect width='400' height='500' fill='#FFF8E1'/><rect x='40' y='50' width='320' height='300' rx='12' fill='#E8F5E9'/><circle cx='130' cy='300' r='35' fill='#FFB74D'/><rect x='105' y='335' width='50' height='70' rx='8' fill='#42A5F5'/><circle cx='200' cy='290' r='40' fill='#A1887F'/><rect x='172' y='330' width='56' height='80' rx='8' fill='#5C6BC0'/><circle cx='270' cy='310' r='30' fill='#FFB74D'/><rect x='60' y='400' width='280' height='60' rx='8' fill='#FFF' opacity='.8'/><rect x='80' y='415' width='160' height='12' rx='6' fill='#24AFC5'/>`);
const ABOUT_IMG = mkSvg(700,600,`<defs><linearGradient id='dsk' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#FF8A65'/><stop offset='1' stop-color='#FFF8E1'/></linearGradient></defs><rect width='700' height='600' fill='url(#dsk)'/><rect y='400' width='700' height='200' fill='#2E7D32'/><rect x='60' y='350' width='300' height='200' fill='#FFF' opacity='.9'/><rect x='340' y='300' width='300' height='250' fill='#F5F5F5'/><polygon points='350,180 60,350 640,350' fill='#8D6E63'/>`);
const ABOUT_FLOAT = mkSvg(400,400,`<rect width='400' height='400' fill='#E0F2F1'/><circle cx='200' cy='150' r='70' fill='#FFCC80'/><rect x='145' y='220' width='110' height='130' rx='20' fill='#009688'/>`);
const TESTI_IMG = mkSvg(600,630,`<rect width='600' height='630' rx='12' fill='#E8F5E9'/><circle cx='300' cy='220' r='100' fill='#FFCC80'/><rect x='220' y='320' width='160' height='200' rx='24' fill='#24AFC5'/>`);
const CTA_IMG = mkSvg(700,850,`<rect width='700' height='850' fill='rgba(36,175,197,.08)'/><rect x='80' y='100' width='540' height='400' rx='16' fill='#FFF' opacity='.15'/><circle cx='350' cy='400' r='80' fill='none' stroke='#24AFC5' stroke-width='2' opacity='.2'/>`);
const LOGO = "https://ebimmo.com/wp-content/uploads/2024/05/e_b_logo-removebg-preview-1.png";
const FALLBACKS = [
  mkSvg(600,450,`<rect width='600' height='450' fill='#E8F5E9'/><rect x='80' y='120' width='440' height='250' rx='4' fill='#FFF'/><polygon points='300,40 80,150 520,150' fill='#8D6E63'/><rect x='240' y='250' width='120' height='120' rx='4' fill='#795548'/>`),
  mkSvg(600,450,`<rect width='600' height='450' fill='#E3F2FD'/><rect x='50' y='80' width='500' height='300' rx='8' fill='#FFF'/><rect x='80' y='120' width='180' height='120' rx='4' fill='#BBDEFB'/><rect x='320' y='120' width='180' height='120' rx='4' fill='#BBDEFB'/>`),
  mkSvg(600,450,`<rect width='600' height='450' fill='#C8E6C9'/><rect x='100' y='200' width='400' height='200' rx='4' fill='#FFF' opacity='.8'/><polygon points='300,80 100,220 500,220' fill='#795548'/>`),
  mkSvg(600,450,`<rect width='600' height='450' fill='#FFF3E0'/><rect x='60' y='100' width='220' height='280' rx='8' fill='#FFF'/><rect x='320' y='100' width='220' height='280' rx='8' fill='#FFF'/>`),
  mkSvg(600,450,`<rect width='600' height='450' fill='#ECEFF1'/><rect x='100' y='60' width='400' height='320' rx='12' fill='#FFF'/><rect x='140' y='100' width='320' height='180' rx='8' fill='#B2EBF2'/>`),
];
const fb = (i) => FALLBACKS[i % FALLBACKS.length];
const handleImgErr = (e, i) => { e.target.onerror = null; e.target.src = fb(i || 0); };

/* ═══ Colors ═══ */
const C = { bush: "#09261D", cyan: "#24AFC5", white: "#FFFFFF", abbey: "#56595A", mine: "#222222", cinder10: "rgba(13,14,19,0.1)", cinder15: "rgba(13,14,19,0.15)", cinder50: "rgba(13,14,19,0.5)", bush15: "rgba(9,38,29,0.15)" };

/* ═══ Reveal animation ═══ */
function useRv(th = 0.1) {
  const ref = useRef(null); const [v, setV] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.disconnect(); } }, { threshold: th }); o.observe(el); return () => o.disconnect(); }, [th]);
  return [ref, v];
}
function Rv({ children, d = 0, style = {} }) {
  const [ref, v] = useRv();
  return <div ref={ref} style={{ opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(24px)", transition: `all .65s cubic-bezier(.22,1,.36,1) ${d * .1}s`, ...style }}>{children}</div>;
}

/* ═══ Pill button ═══ */
function PillBtn({ children, variant = "outline-cyan", onClick, style: s = {}, hideArrow }) {
  const [h, setH] = useState(false);
  const styles = { "outline-white": { border: `1px solid ${C.white}`, color: C.white, bg: "transparent", hBg: "rgba(255,255,255,.1)" }, "outline-cyan": { border: `1px solid ${C.cyan}`, color: C.cyan, bg: "transparent", hBg: "rgba(36,175,197,.08)" }, "solid-cyan": { border: `1px solid ${C.cyan}`, color: C.white, bg: C.cyan, hBg: "#1d9ab0" } };
  const st = styles[variant];
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "12px 28px", borderRadius: 99, border: st.border, background: h ? st.hBg : st.bg, color: st.color, fontFamily: "Urbanist, sans-serif", fontWeight: 500, fontSize: 16, cursor: "pointer", transition: "all .3s", lineHeight: 1.5, whiteSpace: "nowrap", ...s }}>
      {children}
      {!hideArrow && <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </button>
  );
}

/* ═══ Property Card (UNI-style responsive) ═══ */
function PropCard({ p, onClick, idx = 0, mob }) {
  const area = p.area?.value || p.area?.total || 0;
  const [h, setH] = useState(false);
  const title = p.displayTitle || p.title;
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ cursor: "pointer", transition: "transform .4s cubic-bezier(.22,1,.36,1)", transform: h ? "translateY(-4px)" : "" }}>
      <div style={{ width: "100%", aspectRatio: "4/3", borderRadius: 12, overflow: "hidden", background: "#eee", position: "relative" }}>
        <img src={p.thumbnail || fb(idx)} alt={title} onError={(e) => handleImgErr(e, idx)} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .5s", transform: h ? "scale(1.05)" : "" }} />
        {p.photos?.length > 1 && (
          <div style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,.55)", color: "#fff", borderRadius: 6, padding: "4px 8px", fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#fff" strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="#fff"/><path d="M21 15l-5-5L5 21" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {p.photos.length}
          </div>
        )}
      </div>
      <div style={{ marginTop: mob ? 10 : 16 }}>
        <h3 style={{ fontSize: mob ? 14 : 17, fontWeight: 500, color: C.bush, margin: 0, lineHeight: 1.35, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h3>
        <div style={{ fontSize: mob ? 12 : 14, color: C.abbey, marginBottom: 8 }}>
          {p.city && <span>{p.zipcode || ""} {p.city}</span>}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          {p.rooms > 0 && <span style={{ fontSize: mob ? 11 : 12, color: C.abbey, background: "#f3f3f3", borderRadius: 6, padding: "3px 8px" }}>Nb pièces : {p.rooms}</span>}
          {area > 0 && <span style={{ fontSize: mob ? 11 : 12, color: C.abbey, background: "#f3f3f3", borderRadius: 6, padding: "3px 8px" }}>Surface : {area}m²</span>}
        </div>
        <span style={{ fontSize: mob ? 18 : 22, fontWeight: 600, color: C.bush }}>{fmtP(p.price)}</span>
      </div>
    </div>
  );
}

/* ═══ Property Row (UNI-style responsive) ═══ */
function PropRow({ p, onClick, idx = 0, mob }) {
  const area = p.area?.value || p.area?.total || 0;
  const [h, setH] = useState(false);
  const title = p.displayTitle || p.title;
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: "flex", flexDirection: mob ? "column" : "row", gap: mob ? 20 : 30, paddingBottom: mob ? 32 : 50, borderBottom: `1px solid ${C.cinder50}`, cursor: "pointer" }}>
      <div style={{ flex: mob ? "none" : "0 0 50%", borderRadius: 16, overflow: "hidden", height: mob ? 220 : 380, position: "relative" }}>
        <img src={p.thumbnail || fb(idx)} alt={title} onError={(e) => handleImgErr(e, idx)} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .6s", transform: h ? "scale(1.03)" : "" }} />
        {p.photos?.length > 1 && (
          <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,.55)", color: "#fff", borderRadius: 8, padding: "5px 10px", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="#fff" strokeWidth="1.5"/><circle cx="8.5" cy="8.5" r="1.5" fill="#fff"/><path d="M21 15l-5-5L5 21" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {p.photos.length}
          </div>
        )}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h3 style={{ fontSize: mob ? 22 : 34, fontWeight: 500, color: C.bush, lineHeight: 1.2, marginBottom: 6 }}>{title}</h3>
          {p.city && <div style={{ fontSize: mob ? 14 : 16, color: C.abbey, marginBottom: 12 }}>{p.zipcode || ""} {p.city}</div>}
          {/* Characteristics row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            {p.rooms > 0 && <span style={{ fontSize: 13, color: C.abbey, background: "#f3f3f3", borderRadius: 6, padding: "4px 10px" }}>Nb pièces : {p.rooms}</span>}
            {area > 0 && <span style={{ fontSize: 13, color: C.abbey, background: "#f3f3f3", borderRadius: 6, padding: "4px 10px" }}>Surface : {area}m²</span>}
            {p.bedrooms > 0 && <span style={{ fontSize: 13, color: C.abbey, background: "#f3f3f3", borderRadius: 6, padding: "4px 10px" }}>Chambres : {p.bedrooms}</span>}
          </div>
          <p style={{ fontSize: mob ? 14 : 16, color: C.abbey, lineHeight: 1.65, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: mob ? 3 : 4, WebkitBoxOrient: "vertical" }}>{p.description}</p>
        </div>
        <span style={{ fontSize: mob ? 24 : 32, fontWeight: 600, color: C.bush }}>{fmtP(p.price)}</span>
      </div>
    </div>
  );
}

/* ═══ FAQ ═══ */
function FaqItem({ q, a, idx, mob }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.bush15}` }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, padding: mob ? "24px 0" : "36px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: mob ? 18 : 26, fontWeight: 500, color: C.mine, lineHeight: 1.3 }}>{idx}. {q}</span>
        <div style={{ marginTop: 6, position: "relative", width: 20, height: 20, flexShrink: 0 }}>
          <div style={{ position: "absolute", top: "50%", left: 0, width: 20, height: 1.5, background: C.cyan, transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", top: 0, left: "50%", width: 1.5, height: 20, background: C.cyan, transform: `translateX(-50%) ${open ? "scaleY(0)" : "scaleY(1)"}`, transition: "transform .3s" }} />
        </div>
      </button>
      <div style={{ maxHeight: open ? 400 : 0, overflow: "hidden", transition: "max-height .4s cubic-bezier(.22,1,.36,1)" }}>
        <p style={{ fontSize: mob ? 15 : 17, color: C.abbey, lineHeight: 1.65, padding: mob ? "0 0 20px" : "0 0 28px" }}>{a}</p>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN APP ═══════════════ */
export default function App() {
  const [props, setProps] = useState([]);
  const [ld, setLd] = useState(true);
  const [pg, setPg] = useState("home");
  const [sid, setSid] = useState(null);
  const m = useMedia();

  useEffect(() => { fetchProperties().then(d => { setProps(d); setLd(false); }).catch(() => setLd(false)); }, []);
  const go = useCallback((p, id) => { setPg(p); if (id !== undefined) setSid(id); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const px = m.mob ? "20px" : m.tab ? "40px" : "80px";

  return (
    <div style={{ fontFamily: "Urbanist, sans-serif", color: C.bush, background: C.white, minHeight: "100vh", overflowX: "hidden" }}>
      {/* ═══ NAV (responsive: hamburger on mobile) ═══ */}
      <Nav pg={pg} go={go} mob={m.mob} px={px} />

      {pg === "home" && <Home props={props} ld={ld} go={go} m={m} px={px} />}
      {pg === "annonces" && <Annonces props={props} ld={ld} go={go} m={m} px={px} />}
      {pg === "bien" && <Bien props={props} id={sid} go={go} m={m} px={px} />}
      {pg === "contact" && <Contact go={go} m={m} px={px} />}
    </div>
  );
}

/* ═══════ NAV ═══════ */
function Nav({ pg, go, mob, px }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, padding: `14px ${px}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: pg === "home" ? "rgba(9,38,29,.85)" : "rgba(9,38,29,.97)", backdropFilter: "blur(12px)", transition: "background .3s" }}>
        <img src={LOGO} alt="E&B Immo" style={{ height: mob ? 44 : 60, cursor: "pointer", filter: "brightness(10)" }} onClick={() => { go("home"); setMenuOpen(false); }} />
        {mob ? (
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            <div style={{ width: 24, height: 2, background: "#fff", marginBottom: 6, transition: "all .3s", transform: menuOpen ? "rotate(45deg) translate(3px,3px)" : "" }} />
            <div style={{ width: 24, height: 2, background: "#fff", marginBottom: 6, opacity: menuOpen ? 0 : 1, transition: "all .2s" }} />
            <div style={{ width: 24, height: 2, background: "#fff", transition: "all .3s", transform: menuOpen ? "rotate(-45deg) translate(3px,-3px)" : "" }} />
          </button>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            {[["Accueil", "home"], ["Propriétés", "annonces"], ["Nous contacter", "contact"]].map(([l, p]) => (
              <a key={p} onClick={() => go(p)} style={{ fontSize: 16, color: C.white, cursor: "pointer", textDecoration: "none", opacity: pg === p ? 1 : .7, transition: "opacity .2s" }}>{l}</a>
            ))}
            <PillBtn variant="outline-white" onClick={() => go("contact")} style={{ padding: "10px 24px", fontSize: 15 }}>Prendre contact</PillBtn>
          </div>
        )}
      </nav>
      {/* Mobile menu overlay */}
      {mob && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, background: "rgba(9,38,29,.98)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32, opacity: menuOpen ? 1 : 0, pointerEvents: menuOpen ? "all" : "none", transition: "opacity .3s" }}>
          {[["Accueil", "home"], ["Propriétés", "annonces"], ["Nous contacter", "contact"]].map(([l, p]) => (
            <a key={p} onClick={() => { go(p); setMenuOpen(false); }} style={{ fontSize: 28, fontWeight: 500, color: C.white, cursor: "pointer", textDecoration: "none" }}>{l}</a>
          ))}
          <PillBtn variant="outline-white" onClick={() => { go("contact"); setMenuOpen(false); }}>Prendre contact</PillBtn>
        </div>
      )}
    </>
  );
}

/* ═══════ HOME ═══════ */
function Home({ props, ld, go, m, px }) {
  const featured = props.slice(0, m.mob ? 4 : 3);
  const listed = props.slice(0, 3);

  return (
    <main>
      {/* ═══ HERO ═══ */}
      <section style={{ background: C.bush, padding: m.mob ? `100px ${px} 40px` : `148px ${px} 60px`, overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: m.mob ? "column" : "row", gap: m.mob ? 40 : 40, alignItems: m.mob ? "flex-start" : "stretch" }}>
          <div style={{ flex: m.mob ? "none" : "0 0 auto", minWidth: m.mob ? "auto" : m.tab ? 400 : 620, display: "flex", flexDirection: "column", gap: m.mob ? 32 : 50, justifyContent: "flex-end" }}>
            <Rv>
              <h1 style={{ fontSize: m.mob ? 36 : m.tab ? 52 : 80, fontWeight: 500, color: C.white, lineHeight: 1.08, margin: 0 }}>
                Agence<br />immobilière<br />digitale<br />De la côte fleurie
              </h1>
            </Rv>
            <Rv d={2}><PillBtn variant="outline-white" onClick={() => go("annonces")}>Commencer à découvrir</PillBtn></Rv>
          </div>
          {/* Hero image with dome clip */}
          <div style={{ flex: 1, display: "flex", justifyContent: m.mob ? "center" : "flex-end", alignItems: "flex-end", position: "relative" }}>
            <Rv d={3}>
              <div style={{ position: "relative", width: m.mob ? "100%" : m.tab ? 340 : 480, maxWidth: 520 }}>
                <div style={{ width: "100%", aspectRatio: "525/538", borderRadius: "50% 50% 0 0 / 48% 48% 0 0", overflow: "hidden" }}>
                  <img src={HERO_IMG} alt="Maison" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                {!m.mob && (
                  <div style={{ position: "absolute", bottom: 30, left: -50, width: 150, height: 190, borderRadius: 8, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,.25)" }}>
                    <img src={HERO_FLOAT} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </div>
            </Rv>
          </div>
        </div>
      </section>

      {/* ═══ SEARCH BAR ═══ */}
      <section style={{ background: `linear-gradient(to bottom, ${C.bush} 50%, ${C.white} 50%)`, padding: `0 ${px}` }}>
        <Rv>
          <div style={{ background: C.white, border: `1px solid ${C.cinder15}`, borderRadius: 16, padding: m.mob ? 20 : 32, display: "flex", flexDirection: m.mob ? "column" : "row", gap: m.mob ? 12 : 20, boxShadow: "4px 4px 4px rgba(0,0,0,.05)" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ border: `1px solid ${C.cinder10}`, borderRadius: 99, height: m.mob ? 52 : 64, display: "flex", alignItems: "center", padding: m.mob ? "0 100px 0 40px" : "0 130px 0 48px" }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ position: "absolute", left: m.mob ? 14 : 18 }}><path d="M9 17A8 8 0 109 1a8 8 0 000 16zM19 19l-4.35-4.35" stroke={C.abbey} strokeWidth="1.5" strokeLinecap="round"/></svg>
                <input placeholder="Recherche de biens" style={{ flex: 1, border: "none", outline: "none", fontFamily: "Urbanist, sans-serif", fontSize: m.mob ? 14 : 16, color: C.mine, background: "transparent", width: "100%" }} />
              </div>
              <div style={{ position: "absolute", right: 6, top: 6, bottom: 6 }}>
                <button onClick={() => go("annonces")} style={{ height: "100%", padding: m.mob ? "0 16px" : "0 24px", borderRadius: 99, background: C.cyan, border: "none", color: C.white, fontFamily: "Urbanist, sans-serif", fontWeight: 700, fontSize: m.mob ? 14 : 16, cursor: "pointer" }}>Recherche</button>
              </div>
            </div>
            {!m.mob && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {["Propriétés", "Localisation", "Types"].map((l, i) => (
                  <div key={i} style={{ border: `1px solid ${C.cinder10}`, borderRadius: 99, height: 64, display: "flex", alignItems: "center", padding: "0 20px", gap: 10, whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 500, color: C.mine }}>{l}</span>
                    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" style={{ opacity: .4 }}><path d="M4 7l5 5 5-5" stroke={C.mine} strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Rv>
      </section>

      {/* ═══ NOUVELLES ANNONCES ═══ */}
      <section style={{ padding: `${m.mob ? 60 : 120}px ${px} 0`, maxWidth: 1440, margin: "0 auto" }}>
        <Rv>
          <div style={{ display: "flex", flexDirection: m.mob ? "column" : "row", justifyContent: "space-between", alignItems: m.mob ? "flex-start" : "center", gap: 20, marginBottom: m.mob ? 32 : 50 }}>
            <h2 style={{ fontSize: m.mob ? 28 : m.tab ? 40 : 60, fontWeight: 500, color: C.bush, lineHeight: 1.15 }}>Nouvelles annonces</h2>
            <PillBtn variant="outline-cyan" onClick={() => go("annonces")} style={{ fontSize: 15 }}>Tout découvrir</PillBtn>
          </div>
        </Rv>
        <div style={{ display: "grid", gridTemplateColumns: m.mob ? "1fr 1fr" : m.tab ? "1fr 1fr" : "repeat(3, 1fr)", gap: m.mob ? 16 : 28 }}>
          {!ld && featured.map((p, i) => (
            <Rv key={p.id} d={i + 1}><PropCard p={p} idx={i} mob={m.mob} onClick={() => go("bien", p.id)} /></Rv>
          ))}
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section style={{ background: C.bush, padding: `${m.mob ? 60 : 120}px ${px}`, marginTop: m.mob ? 60 : 120 }}>
        <div style={{ display: "flex", flexDirection: m.mob || m.tab ? "column" : "row", gap: m.mob ? 40 : m.tab ? 50 : 100, maxWidth: 1280, margin: "0 auto" }}>
          <Rv>
            <div style={{ position: "relative", width: m.mob ? "100%" : m.tab ? "100%" : 420, flexShrink: 0 }}>
              <img src={ABOUT_IMG} alt="About" style={{ width: "100%", borderRadius: 12 }} />
              {!m.mob && (
                <div style={{ position: "absolute", bottom: "-14%", right: "-10%", width: m.tab ? 180 : 230, height: m.tab ? 180 : 230, borderRadius: "50%", overflow: "hidden" }}>
                  <img src={ABOUT_FLOAT} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </div>
          </Rv>
          <Rv d={2}>
            <div style={{ color: C.white }}>
              <span style={{ fontSize: m.mob ? 16 : 20, fontWeight: 400, display: "block", marginBottom: 12 }}>Explorer tout</span>
              <h2 style={{ fontSize: m.mob ? 26 : m.tab ? 34 : 44, fontWeight: 500, lineHeight: 1.2, marginBottom: 12 }}>L'Évolution d'une Passion Immobilière</h2>
              <p style={{ fontSize: m.mob ? 15 : 17, fontWeight: 400, lineHeight: 1.65, opacity: .85, marginBottom: 32 }}>
                Depuis 7 ans, nous vous accompagnons dans tous vos projets immobiliers avec professionnalisme et passion.
              </p>
              {[
                { t: "Votre partenaire immobilier dévoué", d: "Nous conseillons et guidons à chaque étape de votre démarche.", icon: "M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" },
                { t: "Répondre à vos besoins avec précision", d: "Des solutions adaptées grâce à notre connaissance du marché.", icon: "M12 2L3 7l9 5 9-5-9-5zM3 17l9 5 9-5M3 12l9 5 9-5" },
                { t: "Votre projet, notre engagement", d: "Un accompagnement sur-mesure pour chaque projet unique.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: m.mob ? 24 : 32 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(36,175,197,.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d={item.icon} stroke={C.cyan} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <h4 style={{ fontSize: m.mob ? 17 : 22, fontWeight: 500, lineHeight: 1.3, marginBottom: 6 }}>{item.t}</h4>
                    <p style={{ fontSize: m.mob ? 14 : 16, fontWeight: 400, lineHeight: 1.6, opacity: .8 }}>{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Rv>
        </div>
      </section>

      {/* ═══ LISTE DES NOUVEAUTÉS ═══ */}
      <section style={{ padding: `${m.mob ? 60 : 120}px ${px} 0`, maxWidth: 1440, margin: "0 auto" }}>
        <Rv><h2 style={{ fontSize: m.mob ? 28 : m.tab ? 40 : 60, fontWeight: 500, color: C.bush, lineHeight: 1.15, marginBottom: m.mob ? 32 : 50 }}>Liste des nouveautés</h2></Rv>
        <div style={{ display: "flex", flexDirection: "column", gap: m.mob ? 32 : 50 }}>
          {!ld && listed.map((p, i) => (
            <Rv key={p.id} d={i}><PropRow p={p} idx={i + 3} mob={m.mob} onClick={() => go("bien", p.id)} /></Rv>
          ))}
        </div>
        <Rv d={1} style={{ textAlign: "center", marginTop: m.mob ? 32 : 50 }}>
          <PillBtn variant="outline-cyan" onClick={() => go("annonces")}>Explorer toutes les propriétés</PillBtn>
        </Rv>
      </section>

      {/* ═══ TÉMOIGNAGES ═══ */}
      <section style={{ background: C.bush, padding: `${m.mob ? 60 : 100}px ${px}`, marginTop: m.mob ? 60 : 120 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Rv><h2 style={{ fontSize: m.mob ? 28 : m.tab ? 40 : 60, fontWeight: 500, color: C.white, lineHeight: 1.15, marginBottom: m.mob ? 32 : 50 }}>Témoignages</h2></Rv>
          <Rv d={1}>
            <div style={{ display: "flex", flexDirection: m.mob ? "column" : "row", gap: m.mob ? 24 : 50 }}>
              <div style={{ flex: 1 }}>
                <blockquote style={{ fontSize: m.mob ? 18 : m.tab ? 22 : 28, fontWeight: 400, color: C.white, lineHeight: 1.45, margin: 0, marginBottom: 32 }}>
                  "Nous vous recommandons vivement !!! Benjamin et Émeline ont réussi à trouver notre coup de coeur malgré nos contraintes. Merci à vous deux !!"
                </blockquote>
                <h4 style={{ fontSize: m.mob ? 18 : 22, fontWeight: 500, color: C.white }}>Patricia DENIS</h4>
                <span style={{ fontSize: m.mob ? 14 : 16, color: C.white, opacity: .7 }}>⭐ 5/5 Google Avis</span>
              </div>
              {!m.mob && (
                <div style={{ flex: "0 0 340px" }}>
                  <img src={TESTI_IMG} alt="Témoignage" style={{ width: "100%", borderRadius: 12 }} />
                </div>
              )}
            </div>
          </Rv>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section style={{ padding: `${m.mob ? 60 : 120}px ${px}`, maxWidth: 1064, margin: "0 auto" }}>
        <Rv>
          <h2 style={{ fontSize: m.mob ? 26 : m.tab ? 36 : 56, fontWeight: 500, color: C.bush, lineHeight: 1.15, textAlign: "center", marginBottom: m.mob ? 32 : 50 }}>
            Questions<br />fréquemment posées
          </h2>
        </Rv>
        <Rv d={1}>
          <div>
            <FaqItem mob={m.mob} idx={1} q="Qui sommes-nous ?" a="E&B Immo est une agence immobilière créée par Emeline Burel et Benjamin, fondée sur 7 ans d'expérience. Nous accompagnons nos clients dans leurs projets d'achat, vente et location en Normandie." />
            <FaqItem mob={m.mob} idx={2} q="Comment prendre rendez-vous ?" a="Contactez-nous au +33 7 60 95 36 18 ou par email à contact@eb-immo.fr. Nous répondrons rapidement pour fixer un rendez-vous." />
            <FaqItem mob={m.mob} idx={3} q="Quelle zone géographique couvrez-vous ?" a="La côte fleurie, le Calvados et la Normandie principalement. Nous avons aussi des biens en Corse et en région parisienne." />
          </div>
        </Rv>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ background: C.bush, overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: m.mob ? "column" : "row", gap: m.mob ? 32 : 60, maxWidth: 1440, margin: "0 auto", padding: m.mob ? `60px ${px}` : `0 ${px}` }}>
          {!m.mob && (
            <Rv><div style={{ width: m.tab ? 360 : 500, flexShrink: 0 }}><img src={CTA_IMG} alt="CTA" style={{ width: "100%", height: "auto" }} /></div></Rv>
          )}
          <Rv d={2} style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: m.mob ? 0 : "100px 0" }}>
            <h2 style={{ fontSize: m.mob ? 26 : m.tab ? 36 : 56, fontWeight: 500, color: C.white, lineHeight: 1.2, marginBottom: 32 }}>
              Vous cherchez à acheter ou à louer un bien immobilier ?
            </h2>
            <PillBtn variant="outline-white" onClick={() => go("contact")}>Prendre contact</PillBtn>
          </Rv>
        </div>
      </section>

      <Footer go={go} m={m} px={px} />
    </main>
  );
}

/* ═══════ ANNONCES ═══════ */
function Annonces({ props, ld, go, m, px }) {
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
    <main style={{ paddingTop: m.mob ? 80 : 120 }}>
      <section style={{ padding: `40px ${px} 80px`, maxWidth: 1440, margin: "0 auto" }}>
        <Rv>
          <h1 style={{ fontSize: m.mob ? 30 : m.tab ? 44 : 60, fontWeight: 500, color: C.bush, lineHeight: 1.15, marginBottom: 8 }}>Nos propriétés</h1>
          <span style={{ fontSize: m.mob ? 15 : 17, color: C.abbey, display: "block", marginBottom: 32 }}>{ld ? "Chargement..." : `${fl.length} bien${fl.length > 1 ? "s" : ""} trouvé${fl.length > 1 ? "s" : ""}`}</span>
        </Rv>
        <Rv d={1}>
          <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap", alignItems: "center" }}>
            {[["all", "Tous"], ["maison", "Maisons"], ["appart", "Apparts"], ["terrain", "Terrains"]].map(([k, l]) => (
              <button key={k} onClick={() => setF(k)} style={{ padding: m.mob ? "8px 16px" : "10px 24px", borderRadius: 99, border: `1px solid ${f === k ? C.cyan : C.cinder10}`, background: f === k ? C.cyan : "transparent", color: f === k ? C.white : C.mine, fontFamily: "Urbanist, sans-serif", fontSize: m.mob ? 13 : 15, fontWeight: 500, cursor: "pointer", transition: "all .2s" }}>{l}</button>
            ))}
            <input placeholder="Rechercher..." value={s} onChange={e => setS(e.target.value)} style={{ marginLeft: m.mob ? 0 : "auto", padding: "10px 20px", border: `1px solid ${C.cinder10}`, borderRadius: 99, fontFamily: "Urbanist, sans-serif", fontSize: 15, outline: "none", width: m.mob ? "100%" : 260, background: "transparent" }} />
          </div>
        </Rv>
        <div style={{ display: "grid", gridTemplateColumns: m.mob ? "1fr 1fr" : m.tab ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: m.mob ? 16 : 28 }}>
          {!ld && fl.map((p, i) => (
            <Rv key={p.id} d={Math.min(i % 3 + 1, 3)}><PropCard p={p} idx={i} mob={m.mob} onClick={() => go("bien", p.id)} /></Rv>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <a onClick={() => go("home")} style={{ fontSize: 16, color: C.abbey, cursor: "pointer", textDecoration: "underline" }}>← Retour à l'accueil</a>
        </div>
      </section>
      <Footer go={go} m={m} px={px} />
    </main>
  );
}

/* ═══════ BIEN DETAIL ═══════ */
function Bien({ props, id, go, m, px }) {
  const p = props.find(x => x.id === id);
  const [photoIdx, setPhotoIdx] = useState(0);
  if (!p) return <div style={{ padding: 200, textAlign: "center", fontSize: 20 }}>Bien non trouvé</div>;
  const area = p.area?.value || p.area?.total || 0;
  const photos = p.photos?.length ? p.photos : [p.thumbnail || fb(0)];
  const title = p.displayTitle || p.title;

  return (
    <main style={{ paddingTop: m.mob ? 80 : 120 }}>
      <section style={{ padding: `32px ${px} 80px`, maxWidth: 1440, margin: "0 auto" }}>
        <a onClick={() => go("annonces")} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, color: C.cyan, cursor: "pointer", marginBottom: 28, textDecoration: "none" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={C.cyan} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Retour aux propriétés
        </a>

        {/* Photo gallery */}
        <div style={{ display: "grid", gridTemplateColumns: m.mob ? "1fr" : photos.length > 1 ? "2fr 1fr" : "1fr", gap: 6, marginBottom: 32, borderRadius: 16, overflow: "hidden", maxHeight: m.mob ? 280 : 500 }}>
          <div style={{ cursor: "pointer" }} onClick={() => {}}>
            <img src={photos[photoIdx] || fb(0)} alt={title} onError={(e) => handleImgErr(e, 0)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          {!m.mob && photos.length > 1 && (
            <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 6 }}>
              {photos.slice(1, 3).map((ph, i) => (
                <div key={i} style={{ overflow: "hidden", cursor: "pointer", position: "relative" }} onClick={() => setPhotoIdx(i + 1)}>
                  <img src={ph} alt="" onError={(e) => handleImgErr(e, i + 1)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {i === 1 && photos.length > 3 && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 500 }}>+{photos.length - 3} photos</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {photos.length > 1 && (
          <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 32, paddingBottom: 4 }}>
            {photos.map((ph, i) => (
              <div key={i} onClick={() => setPhotoIdx(i)} style={{ flex: `0 0 ${m.mob ? 64 : 80}px`, height: m.mob ? 48 : 58, borderRadius: 6, overflow: "hidden", cursor: "pointer", border: photoIdx === i ? `2px solid ${C.cyan}` : "2px solid transparent", opacity: photoIdx === i ? 1 : .7, transition: "all .2s" }}>
                <img src={ph} alt="" onError={(e) => handleImgErr(e, i)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: m.mob ? "1fr" : "1.5fr 1fr", gap: m.mob ? 32 : 60, alignItems: "start" }}>
          {/* Left: title, description, informations */}
          <div>
            {/* Title — E&B style: uppercase */}
            <h1 style={{ fontSize: m.mob ? 22 : m.tab ? 30 : 38, fontWeight: 600, color: C.bush, lineHeight: 1.25, marginBottom: 12, textTransform: "uppercase" }}>{title}</h1>

            {/* Price */}
            <div style={{ fontSize: m.mob ? 28 : 36, fontWeight: 600, color: C.bush, marginBottom: 12 }}>€ {Number(p.price).toLocaleString("fr-FR")}</div>

            {/* City + zip + ref */}
            <div style={{ fontSize: 15, color: C.abbey, marginBottom: 6 }}>{p.city}{p.zipcode ? ` - ${p.zipcode}` : ""}</div>
            {p.reference && <div style={{ fontSize: 14, color: C.abbey, marginBottom: 24 }}>#{p.reference}</div>}

            {/* 3 badges like ebimmo.com */}
            <div style={{ display: "flex", gap: m.mob ? 12 : 20, marginBottom: 36, flexWrap: "wrap" }}>
              {[
                p.rooms > 0 && [`${p.rooms} Pièce${p.rooms > 1 ? "s" : ""}`, "M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"],
                [`${p.bedrooms || 0} Salle de bains`, "M21 10H7M21 6H3M21 14H3M21 18H7"],
                area > 0 && [`${area} m²`, "M3 3h18v18H3zM3 9h18M9 3v18"],
              ].filter(Boolean).map(([label, icon], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: m.mob ? 14 : 15, color: C.mine, fontWeight: 500 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f3f3f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d={icon} stroke={C.cyan} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {label}
                </div>
              ))}
            </div>

            {/* Description — white-space pre-line like ebimmo */}
            {p.description && (
              <div style={{ marginBottom: 40 }}>
                <p style={{ fontSize: m.mob ? 15 : 16, color: C.abbey, lineHeight: 1.75, whiteSpace: "pre-line" }}>{p.description}</p>
              </div>
            )}

            {/* Informations section — like ebimmo.com */}
            <div style={{ borderTop: `1px solid ${C.cinder10}`, paddingTop: 28 }}>
              <h2 style={{ fontSize: m.mob ? 20 : 24, fontWeight: 600, color: C.bush, marginBottom: 20 }}>Informations</h2>
              <div style={{ display: "grid", gridTemplateColumns: m.mob ? "1fr" : "1fr 1fr", gap: 0 }}>
                {[
                  p.category && ["Catégorie", p.category],
                  p.type && ["Type", `${p.type}${p.subtype ? ` / ${p.subtype}` : ""}`],
                  area > 0 && ["Surfaces", `${area} m²`],
                  p.area?.total > 0 && p.area.total !== area && ["Surface terrain", `${p.area.total} m²`],
                  ["Prix", `€ ${Number(p.price).toLocaleString("fr-FR")}`],
                  p.rooms > 0 && ["Pièces", p.rooms],
                  p.bedrooms > 0 && ["Chambres", p.bedrooms],
                  p.reference && ["Référence", p.reference],
                ].filter(Boolean).map(([label, value], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.cinder10}` }}>
                    <span style={{ fontSize: 15, color: C.abbey }}>{label}:</span>
                    <span style={{ fontSize: 15, fontWeight: 500, color: C.mine }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: sticky agent contact card */}
          <div style={{ position: m.mob ? "relative" : "sticky", top: m.mob ? 0 : 120 }}>
            <div style={{ background: "#f7f7f7", borderRadius: 16, padding: m.mob ? 20 : 28, marginBottom: 20 }}>
              <h3 style={{ fontSize: m.mob ? 18 : 22, fontWeight: 600, color: C.bush, marginBottom: 20 }}>Formulaire de contact</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input placeholder="Nom" style={inpS} />
                <input placeholder="Prénom" style={inpS} />
                <input placeholder="Téléphone" type="tel" style={inpS} />
                <input placeholder="Email" type="email" style={inpS} />
                <textarea placeholder="Message" rows={4} style={{ ...inpS, resize: "vertical" }} />
                <PillBtn variant="solid-cyan" onClick={() => {}} style={{ width: "100%", justifyContent: "center" }} hideArrow>Envoyer</PillBtn>
              </div>
            </div>
            {/* Agent info */}
            <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "16px 0" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.bush, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 600 }}>EB</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.mine }}>E&B Immo</div>
                <div style={{ fontSize: 14, color: C.abbey }}>Agence immobilière</div>
              </div>
            </div>
            {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textAlign: "center", marginTop: 10, fontSize: 15, color: C.cyan, textDecoration: "underline" }}>Voir sur ebimmo.com</a>}
          </div>
        </div>
      </section>
      <Footer go={go} m={m} px={px} />
    </main>
  );
}

/* ═══════ CONTACT ═══════ */
function Contact({ go, m, px }) {
  return (
    <main style={{ paddingTop: m.mob ? 80 : 120 }}>
      <section style={{ padding: `40px ${px} 80px`, maxWidth: 1280, margin: "0 auto" }}>
        <Rv><h1 style={{ fontSize: m.mob ? 30 : m.tab ? 44 : 60, fontWeight: 500, color: C.bush, lineHeight: 1.15, marginBottom: m.mob ? 32 : 50 }}>Nous contacter</h1></Rv>
        <div style={{ display: "grid", gridTemplateColumns: m.mob ? "1fr" : "1fr 1fr", gap: m.mob ? 32 : 60 }}>
          <Rv d={1}>
            <div>
              <p style={{ fontSize: m.mob ? 15 : 17, color: C.abbey, lineHeight: 1.65, marginBottom: 32 }}>
                Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner dans votre projet immobilier.
              </p>
              {[["📞", "+33 7 60 95 36 18"], ["✉️", "contact@eb-immo.fr"], ["📍", "1 rue Jacques Pasquier, 14390 Petiville"]].map(([ic, v], i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{ic}</div>
                  <span style={{ fontSize: m.mob ? 15 : 17, fontWeight: 500, color: C.abbey }}>{v}</span>
                </div>
              ))}
            </div>
          </Rv>
          <Rv d={2}>
            <div style={{ background: "#f5f5f5", borderRadius: 16, padding: m.mob ? 24 : 40 }}>
              <h3 style={{ fontSize: m.mob ? 22 : 26, fontWeight: 500, marginBottom: 20 }}>Envoyez-nous un message</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: m.mob ? "1fr" : "1fr 1fr", gap: 14 }}>
                  <input placeholder="Nom" style={inpS} />
                  <input placeholder="Prénom" style={inpS} />
                </div>
                <input placeholder="Email" type="email" style={inpS} />
                <input placeholder="Téléphone" type="tel" style={inpS} />
                <textarea placeholder="Votre message..." rows={4} style={{ ...inpS, resize: "vertical" }} />
                <PillBtn variant="solid-cyan" onClick={() => {}} style={{ width: "100%", justifyContent: "center" }} hideArrow>Envoyer</PillBtn>
              </div>
            </div>
          </Rv>
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a onClick={() => go("home")} style={{ fontSize: 15, color: C.abbey, cursor: "pointer", textDecoration: "underline" }}>← Retour à l'accueil</a>
        </div>
      </section>
      <Footer go={go} m={m} px={px} />
    </main>
  );
}

const inpS = { width: "100%", padding: "14px 18px", border: `1px solid rgba(13,14,19,0.1)`, borderRadius: 12, fontFamily: "Urbanist, sans-serif", fontSize: 16, outline: "none", background: "#fff" };

/* ═══════ FOOTER ═══════ */
function Footer({ go, m, px }) {
  return (
    <footer style={{ padding: `${m.mob ? 48 : 80}px ${px} 24px`, maxWidth: 1440, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: m.mob ? "column" : "row", gap: m.mob ? 40 : m.tab ? 60 : 120, marginBottom: m.mob ? 32 : 50 }}>
        <div style={{ maxWidth: m.mob ? "100%" : 300, flexShrink: 0 }}>
          <img src={LOGO} alt="E&B Immo" style={{ width: 100, marginBottom: 16 }} />
          <p style={{ fontSize: 15, color: C.bush, lineHeight: 1.65, marginBottom: 20 }}>
            Votre partenaire de confiance pour tous vos besoins immobiliers.
          </p>
          <PillBtn variant="outline-cyan" onClick={() => go("contact")} style={{ fontSize: 14, padding: "8px 22px" }}>Prendre contact</PillBtn>
        </div>
        <div style={{ display: "flex", gap: m.mob ? 40 : 60, flex: 1, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <h4 style={{ fontSize: 16, fontWeight: 500, color: C.bush, marginBottom: 14 }}>Pages</h4>
            {["Accueil", "Propriétés", "Contact"].map((l, i) => (
              <a key={i} onClick={() => go(["home", "annonces", "contact"][i])} style={{ display: "block", fontSize: 15, fontWeight: 500, color: C.abbey, cursor: "pointer", marginBottom: 10, lineHeight: 1.6 }}>{l}</a>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <h4 style={{ fontSize: 16, fontWeight: 500, color: C.bush, marginBottom: 14 }}>Contact</h4>
            <span style={{ display: "block", fontSize: 15, color: C.abbey, marginBottom: 8, lineHeight: 1.6 }}>+33 7 60 95 36 18</span>
            <span style={{ display: "block", fontSize: 15, color: C.abbey, marginBottom: 8, lineHeight: 1.6 }}>contact@eb-immo.fr</span>
            <span style={{ display: "block", fontSize: 15, color: C.abbey, lineHeight: 1.6 }}>1 rue Jacques Pasquier<br />14390 Petiville</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: `1px solid rgba(86,89,90,.3)`, paddingTop: 20, display: "flex", flexDirection: m.mob ? "column" : "row", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 14, color: C.abbey }}>© 2025 E&B Immo. Tous droits réservés.</span>
        <span style={{ fontSize: 14, color: C.abbey }}>Propulsé par Apimo</span>
      </div>
    </footer>
  );
}
