"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ═══ APIMO API CONFIG ═══ */
const APIMO_PROVIDER = "4019";
const APIMO_TOKEN = "5ccdef5377bd6f2f41681f17233c7818a3484333";
const APIMO_AGENCY = "23650";
const FALLBACK_API = "https://tst-drab-eta.vercel.app/api/properties";

/* Apimo type/category ID mappings → French labels */
const APIMO_CATEGORIES = { 1: "Vente", 2: "Location", 3: "Viager", 4: "Saisonnier" };
const APIMO_TYPES = {
  1: "Appartement", 2: "Maison", 3: "Terrain", 4: "Parking", 5: "Bureau",
  6: "Commerce", 7: "Immeuble", 8: "Loft", 9: "Château", 10: "Local",
  11: "Villa", 12: "Ferme", 13: "Propriété", 14: "Manoir", 15: "Hôtel particulier",
  16: "Programme neuf", 17: "Fonds de commerce", 18: "Entrepôt", 19: "Chambre",
  20: "Studio", 21: "Duplex", 22: "Triplex",
};

function resolveApimoField(field) {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (typeof field === "object" && field.name) return field.name;
  if (typeof field === "number") return APIMO_TYPES[field] || APIMO_CATEGORIES[field] || "";
  return String(field);
}

/* Format title like ebimmo.com: "MAISON DE VILLE A RENOVER – 63M² – BIEVILLE-BEUVILLE" */
function fmtTitle(p) {
  /* 1. If Apimo provides a name, use it directly */
  if (p.name && p.name.length > 3) return p.name.toUpperCase();
  /* 2. Otherwise build from type + area + city */
  const type = resolveApimoField(p.type) || resolveApimoField(p.subtype) || resolveApimoField(p.category) || "Bien";
  const area = p.area?.value || p.area?.total || 0;
  const areaStr = area ? `${area}M²` : "";
  const city = typeof p.city === "object" ? (p.city?.name || "") : (p.city || "");
  return [type.toUpperCase(), areaStr, city.toUpperCase()].filter(Boolean).join(" – ");
}

/* Use Apimo raw description, or auto-generate an E&B Immo style one */
function fmtDesc(p) {
  const raw = (p.comments || []).map(c => c.comment).filter(Boolean).join("\n\n");
  if (raw && raw.length > 30) return raw;
  const type = (resolveApimoField(p.type) || resolveApimoField(p.subtype) || "bien").toLowerCase();
  const rooms = p.rooms || 0;
  const beds = p.bedrooms || 0;
  const area = p.area?.value || p.area?.total || 0;
  const cityName = typeof p.city === "object" ? (p.city?.name || "Normandie") : (p.city || "Normandie");
  const zip = typeof p.city === "object" ? (p.city?.zipcode || "") : "";
  const isFem = type === "maison" || type === "villa" || type.endsWith("e");
  const lines = [];
  lines.push(`NOUVEAUTÉ CHEZ E&B IMMO`);
  if (area > 0) {
    lines.push(`Sur la commune de ${cityName.toUpperCase()}${zip ? ` (${zip})` : ""}, nous vous proposons de découvrir ${isFem ? "cette" : "ce"} ${type} de ${area}m²${rooms ? ` comprenant ${rooms} pièce${rooms > 1 ? "s" : ""}` : ""}${beds ? ` dont ${beds} chambre${beds > 1 ? "s" : ""}` : ""}.`);
  } else {
    lines.push(`${type.charAt(0).toUpperCase() + type.slice(1)} situé${isFem ? "e" : ""} à ${cityName}${zip ? ` (${zip})` : ""}.`);
  }
  if (p.area?.total && p.area.total > area) lines.push(`Terrain de ${p.area.total} m².`);
  lines.push(`Pour plus d'informations ou organiser une visite :\nEmeline BUREL\n07 60 95 36 18\ncontact@eb-immo.fr`);
  return lines.join("\n\n");
}

function normalizeApimo(p) {
  const photos = (p.pictures || []).map(pic => pic.url).filter(Boolean);
  const typeName = resolveApimoField(p.type);
  const subtypeName = resolveApimoField(p.subtype);
  const categoryName = resolveApimoField(p.category);
  const cityName = typeof p.city === "object" ? (p.city?.name || "") : (p.city || "");
  const zipCode = typeof p.city === "object" ? (p.city?.zipcode || "") : "";
  /* Extract services/amenities */
  const services = [];
  if (p.services) Object.entries(p.services).forEach(([k, v]) => { if (v && typeof v === "boolean") services.push(k.replace(/_/g, " ")); else if (v && typeof v === "string") services.push(v); });
  if (p.amenities && Array.isArray(p.amenities)) p.amenities.forEach(a => services.push(typeof a === "object" ? (a.name || a.value || "") : String(a)));
  /* Extract regulations (DPE, GES, etc.) */
  const regulations = {};
  if (p.regulations) Object.entries(p.regulations).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== "" && v !== 0) regulations[k] = v; });
  if (p.energy) regulations.energy = p.energy;
  if (p.gas) regulations.gas = p.gas;
  /* Virtual tour */
  const virtualTour = p.virtual_tour || p.virtual_visit || "";
  /* Agent / user */
  const agent = p.user ? { name: [p.user.firstname, p.user.lastname].filter(Boolean).join(" "), phone: p.user.phone || p.user.mobile || "", email: p.user.email || "", photo: p.user.picture || "" } : null;
  return {
    id: p.id, title: p.name || fmtTitle(p),
    displayTitle: fmtTitle(p),
    price: p.price?.value || 0, rooms: p.rooms || 0, bedrooms: p.bedrooms || 0,
    bathrooms: p.bathrooms || 0,
    area: { value: p.area?.value || 0, total: p.area?.total || 0 },
    city: cityName, zipcode: zipCode, reference: p.reference || "",
    thumbnail: photos[0] || "", photos, url: p.url || "",
    description: fmtDesc(p),
    category: categoryName, type: typeName, subtype: subtypeName,
    address: p.publish_address ? p.address : "",
    latitude: p.latitude, longitude: p.longitude,
    services: services.filter(Boolean),
    regulations,
    virtualTour,
    agent,
    condition: p.condition?.name || resolveApimoField(p.condition) || "",
    availability: p.available_at || p.availability || "",
    heating: p.heating ? (p.heating.device?.name || resolveApimoField(p.heating?.device) || "") : "",
    _raw: p,
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

/* ═══ Search helpers ═══ */
const DEFAULT_SEARCHQ = { text: "", city: "", types: [], budgetMin: "", budgetMax: "", areaMin: "", areaMax: "" };
const TYPE_OPTIONS = [["maison", "Maison"], ["appart", "Appartement"], ["terrain", "Terrain"]];
function norm(v) { return (v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
function typeMatches(title, type, key) {
  const t = norm(title + " " + type);
  if (key === "maison") return /maison|villa|pavillon|longere|longère/.test(t);
  if (key === "appart") return /appartement|studio|duplex|loft|appartment/.test(t);
  if (key === "terrain") return /terrain/.test(t);
  return false;
}
function propertyMatchesSearch(x, q) {
  if (q.text && !norm(x.title + " " + x.city + " " + x.description).includes(norm(q.text))) return false;
  if (q.city && !norm(x.city).includes(norm(q.city))) return false;
  if (q.types.length && !q.types.some(k => typeMatches(x.title, x.type, k))) return false;
  if (q.budgetMin && x.price < Number(q.budgetMin)) return false;
  if (q.budgetMax && x.price > Number(q.budgetMax)) return false;
  if (q.areaMin && (x.area?.value || 0) < Number(q.areaMin)) return false;
  if (q.areaMax && (x.area?.value || 0) > Number(q.areaMax)) return false;
  return true;
}

/* ═══ Dual Range Slider ═══ */
function DualRangeSlider({ min = 0, max = 1500000, step = 10000, valueMin, valueMax, onChange, unit = "€", maxLabel = null }) {
  const trackRef = useRef(null);
  const dragging = useRef(null); // "min" | "max" | null

  const pct = v => ((v - min) / (max - min)) * 100;

  function clamp(v) { return Math.min(max, Math.max(min, Math.round(v / step) * step)); }

  function posToVal(clientX) {
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return clamp(min + ratio * (max - min));
  }

  function onMove(e) {
    if (!dragging.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const v = posToVal(clientX);
    if (dragging.current === "min") onChange(Math.min(v, valueMax - step), valueMax);
    else onChange(valueMin, Math.max(v, valueMin + step));
  }

  function onUp() { dragging.current = null; }

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  });

  const fmtVal = v => {
    const atMax = v >= max;
    const label = atMax && maxLabel ? maxLabel : v.toLocaleString("fr-FR") + (unit === "€" ? " €" : " " + unit);
    return label;
  };

  const minLabel = unit === "€" ? "0 €" : "0 " + unit;
  const endLabel = maxLabel || (max.toLocaleString("fr-FR") + (unit === "€" ? " €+" : "+ " + unit));

  return (
    <div style={{ padding: "32px 24px 0" }}>
      {/* Track */}
      <div ref={trackRef} style={{ position: "relative", height: 2, margin: "0 12px", cursor: "pointer" }}
        onMouseDown={e => {
          const v = posToVal(e.clientX);
          const dMin = Math.abs(v - valueMin); const dMax = Math.abs(v - valueMax);
          dragging.current = dMin <= dMax ? "min" : "max";
        }}>
        {/* Dashed grey full track */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, borderTop: `2px dashed ${C.bush15}` }} />
        {/* Left handle */}
        <div
          onMouseDown={e => { e.stopPropagation(); dragging.current = "min"; }}
          onTouchStart={e => { e.stopPropagation(); dragging.current = "min"; }}
          style={{ position: "absolute", top: "50%", left: `${pct(valueMin)}%`, transform: "translate(-50%, -50%)", width: 20, height: 20, borderRadius: "50%", background: C.bush, cursor: "grab", zIndex: 2, boxShadow: "0 2px 8px rgba(9,38,29,.35)", touchAction: "none" }} />
        {/* Right handle */}
        <div
          onMouseDown={e => { e.stopPropagation(); dragging.current = "max"; }}
          onTouchStart={e => { e.stopPropagation(); dragging.current = "max"; }}
          style={{ position: "absolute", top: "50%", left: `${pct(valueMax)}%`, transform: "translate(-50%, -50%)", width: 20, height: 20, borderRadius: "50%", background: C.bush, cursor: "grab", zIndex: 2, boxShadow: "0 2px 8px rgba(9,38,29,.35)", touchAction: "none" }} />
      </div>
      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 13, color: "#aaa" }}>
        <span>{minLabel}</span><span>{endLabel}</span>
      </div>
      {/* Selected range */}
      <div style={{ textAlign: "center", marginTop: 12, paddingBottom: 28, fontSize: 16, fontWeight: 600, color: C.bush }}>
        {fmtVal(valueMin)} — {fmtVal(valueMax)}
      </div>
    </div>
  );
}

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

  /* ── Shared search state (Home ↔ Annonces) ── */
  const [sq, setSq] = useState(DEFAULT_SEARCHQ);
  const [budgetRange, setBudgetRange] = useState([0, 1500000]);
  const [areaRange, setAreaRange] = useState([0, 500]);

  useEffect(() => { fetchProperties().then(d => { setProps(d); setLd(false); }).catch(() => setLd(false)); }, []);
  const go = useCallback((p, id) => { setPg(p); if (id !== undefined) setSid(id); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const px = m.mob ? "20px" : m.tab ? "40px" : "80px";
  const searchProps = { sq, setSq, budgetRange, setBudgetRange, areaRange, setAreaRange };

  return (
    <div style={{ fontFamily: "Urbanist, sans-serif", color: C.bush, background: C.white, minHeight: "100vh", overflowX: "hidden" }}>
      {/* ═══ NAV (responsive: hamburger on mobile) ═══ */}
      <Nav pg={pg} go={go} mob={m.mob} px={px} />

      {pg === "home" && <Home props={props} ld={ld} go={go} m={m} px={px} {...searchProps} />}
      {pg === "annonces" && <Annonces props={props} ld={ld} go={go} m={m} px={px} {...searchProps} />}
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

/* ═══════ FILTER BAR COMPONENT (Nos propriétés) ═══════ */
function FilterBar({ sq, setSq, budgetRange, setBudgetRange, areaRange, setAreaRange, allProps, onSearch, m }) {
  const [openFilter, setOpenFilter] = useState(null); // null | "city"|"types"|"budget"|"surface"
  const [showCitySug, setShowCitySug] = useState(false);
  const wrapRef = useRef(null);
  const cityWrapRef = useRef(null);

  const cities = [...new Set((allProps || []).map(p => p.city).filter(Boolean))].sort();
  const citySuggestions = sq.city.trim().length < 2 ? [] : cities.filter(c => norm(c).includes(norm(sq.city))).slice(0, 8);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpenFilter(null); setShowCitySug(false); }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function clearAll() { setSq(DEFAULT_SEARCHQ); setBudgetRange([0, 1500000]); setAreaRange([0, 500]); setOpenFilter(null); }

  const hasCity = !!sq.city;
  const hasTypes = sq.types.length > 0;
  const hasBudget = budgetRange[0] > 0 || budgetRange[1] < 1500000;
  const hasSurface = areaRange[0] > 0 || areaRange[1] < 500;
  const hasAny = hasCity || hasTypes || hasBudget || hasSurface;

  const fmtK = v => v >= 1000 ? Math.round(v / 1000) + "k" : String(v);
  const budgetLabel = hasBudget
    ? (budgetRange[0] > 0 && budgetRange[1] < 1500000 ? fmtK(budgetRange[0]) + " – " + fmtK(budgetRange[1]) + " €"
      : budgetRange[0] > 0 ? "≥ " + fmtK(budgetRange[0]) + " €"
      : "≤ " + fmtK(budgetRange[1]) + " €")
    : "Budget";
  const surfaceLabel = hasSurface
    ? (areaRange[0] > 0 && areaRange[1] < 500 ? areaRange[0] + " – " + areaRange[1] + " m²"
      : areaRange[0] > 0 ? "≥ " + areaRange[0] + " m²"
      : "≤ " + areaRange[1] + " m²")
    : "Surface";

  const pillStyle = (active) => ({
    height: m.mob ? 36 : 40, padding: m.mob ? "0 12px" : "0 16px", borderRadius: 99,
    border: `1px solid ${active ? C.bush : C.cinder15}`,
    background: active ? "rgba(9,38,29,0.08)" : C.white,
    color: active ? C.bush : C.abbey,
    fontFamily: "Urbanist, sans-serif", fontSize: m.mob ? 12 : 13, fontWeight: active ? 600 : 400,
    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
  });
  const chevron = (open) => (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
      <path d={open ? "M9 5L5 1 1 5" : "M1 1l4 4 4-4"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div ref={wrapRef} style={{ background: C.white, border: `1px solid ${C.cinder15}`, borderRadius: 16, padding: m.mob ? 16 : 20, boxShadow: "4px 4px 4px rgba(0,0,0,.05)" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>

        {/* ── Localité ── */}
        <div style={{ position: "relative" }}>
          <button style={pillStyle(hasCity || openFilter === "city")} onClick={() => setOpenFilter(v => v === "city" ? null : "city")}>
            {hasCity ? sq.city : "Localité"} {chevron(openFilter === "city")}
          </button>
          {openFilter === "city" && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 50, background: C.white, border: `1px solid ${C.cinder15}`, borderRadius: 14, boxShadow: "0 12px 36px rgba(0,0,0,.12)", padding: 16, width: 280 }}>
              <div ref={cityWrapRef} style={{ position: "relative" }}>
                <input value={sq.city} autoFocus onFocus={() => setShowCitySug(true)}
                  onChange={e => { setSq(q => ({ ...q, city: e.target.value })); setShowCitySug(true); }}
                  placeholder="Ex : Cabourg, Deauville…"
                  style={{ width: "100%", height: 42, borderRadius: 10, border: `1px solid ${C.cinder10}`, padding: "0 12px", fontFamily: "Urbanist, sans-serif", fontSize: 14, outline: "none", boxSizing: "border-box", color: C.mine }} />
                {showCitySug && citySuggestions.length > 0 && (
                  <div style={{ position: "absolute", left: 0, right: 0, top: 46, background: C.white, border: `1px solid ${C.cinder15}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.1)", maxHeight: 200, overflowY: "auto", zIndex: 60 }}>
                    {citySuggestions.map(c => (
                      <button key={c} onClick={() => { setSq(q => ({ ...q, city: c })); setShowCitySug(false); setOpenFilter(null); }}
                        style={{ width: "100%", textAlign: "left", padding: "9px 12px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "Urbanist, sans-serif", fontSize: 14, color: C.mine }}>{c}</button>
                    ))}
                  </div>
                )}
              </div>
              {hasCity && <button onClick={() => setSq(q => ({ ...q, city: "" }))} style={{ marginTop: 8, fontSize: 12, color: C.abbey, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Effacer</button>}
            </div>
          )}
        </div>

        {/* ── Type de bien ── */}
        <div style={{ position: "relative" }}>
          <button style={pillStyle(hasTypes || openFilter === "types")} onClick={() => setOpenFilter(v => v === "types" ? null : "types")}>
            {hasTypes ? (sq.types.length === 1 ? TYPE_OPTIONS.find(x => x[0] === sq.types[0])?.[1] : sq.types.length + " types") : "Type de bien"} {chevron(openFilter === "types")}
          </button>
          {openFilter === "types" && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 50, background: C.white, border: `1px solid ${C.cinder15}`, borderRadius: 14, boxShadow: "0 12px 36px rgba(0,0,0,.12)", padding: 16, width: 260 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TYPE_OPTIONS.map(([key, label]) => {
                  const on = sq.types.includes(key);
                  return (
                    <button key={key} onClick={() => setSq(q => ({ ...q, types: on ? q.types.filter(t => t !== key) : [...q.types, key] }))}
                      style={{ height: 36, padding: "0 14px", borderRadius: 99, border: `1px solid ${on ? C.bush : C.cinder10}`, background: on ? C.bush : "transparent", color: on ? C.white : C.mine, fontFamily: "Urbanist, sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                      {label}
                    </button>
                  );
                })}
              </div>
              {hasTypes && <button onClick={() => setSq(q => ({ ...q, types: [] }))} style={{ marginTop: 8, fontSize: 12, color: C.abbey, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Effacer</button>}
            </div>
          )}
        </div>

        {/* ── Budget ── */}
        <div style={{ position: "relative" }}>
          <button style={pillStyle(hasBudget || openFilter === "budget")} onClick={() => setOpenFilter(v => v === "budget" ? null : "budget")}>
            {budgetLabel} {chevron(openFilter === "budget")}
          </button>
          {openFilter === "budget" && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 50, background: C.white, border: `1px solid ${C.cinder15}`, borderRadius: 14, boxShadow: "0 12px 36px rgba(0,0,0,.12)", width: 280 }}>
              <DualRangeSlider min={0} max={1500000} step={10000} valueMin={budgetRange[0]} valueMax={budgetRange[1]} onChange={(lo, hi) => setBudgetRange([lo, hi])} />
              {hasBudget && <div style={{ padding: "0 16px 14px", textAlign: "right" }}><button onClick={() => setBudgetRange([0, 1500000])} style={{ fontSize: 12, color: C.abbey, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Effacer</button></div>}
            </div>
          )}
        </div>

        {/* ── Surface ── */}
        <div style={{ position: "relative" }}>
          <button style={pillStyle(hasSurface || openFilter === "surface")} onClick={() => setOpenFilter(v => v === "surface" ? null : "surface")}>
            {surfaceLabel} {chevron(openFilter === "surface")}
          </button>
          {openFilter === "surface" && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 50, background: C.white, border: `1px solid ${C.cinder15}`, borderRadius: 14, boxShadow: "0 12px 36px rgba(0,0,0,.12)", width: 280 }}>
              <DualRangeSlider min={0} max={500} step={5} valueMin={areaRange[0]} valueMax={areaRange[1]} onChange={(lo, hi) => setAreaRange([lo, hi])} unit="m²" maxLabel="500+ m²" />
              {hasSurface && <div style={{ padding: "0 16px 14px", textAlign: "right" }}><button onClick={() => setAreaRange([0, 500])} style={{ fontSize: 12, color: C.abbey, background: "none", border: "none", cursor: "pointer", padding: 0 }}>Effacer</button></div>}
            </div>
          )}
        </div>

        {/* ── Reset + Search ── */}
        {hasAny && (
          <button onClick={clearAll} style={{ height: m.mob ? 36 : 40, padding: "0 12px", borderRadius: 99, border: `1px solid ${C.cinder10}`, background: "transparent", color: C.abbey, fontFamily: "Urbanist, sans-serif", fontSize: m.mob ? 12 : 13, cursor: "pointer" }}>
            ✕ Réinitialiser
          </button>
        )}
        <button onClick={() => { setOpenFilter(null); onSearch(); }}
          style={{ marginLeft: "auto", height: m.mob ? 36 : 44, padding: m.mob ? "0 18px" : "0 28px", borderRadius: 99, border: "none", background: C.cyan, color: C.white, fontFamily: "Urbanist, sans-serif", fontWeight: 700, fontSize: m.mob ? 13 : 15, cursor: "pointer", flexShrink: 0 }}>
          Rechercher
        </button>
      </div>
    </div>
  );
}

/* ═══════ SEARCH BAR COMPONENT (Home) ═══════ */
function SearchBar({ sq, setSq, budgetRange, setBudgetRange, areaRange, setAreaRange, allProps, onSearch, m }) {
  const [activeTab, setActiveTab] = useState(null);
  const [showCitySug, setShowCitySug] = useState(false);
  const searchBarRef = useRef(null);
  const cityWrapRef = useRef(null);

  const cities = [...new Set((allProps || []).map(p => p.city).filter(Boolean))].sort();
  const citySuggestions = sq.city.trim().length < 2 ? [] : cities.filter(c => norm(c).includes(norm(sq.city))).slice(0, 8);

  useEffect(() => {
    const onDocClick = (e) => {
      if (cityWrapRef.current && !cityWrapRef.current.contains(e.target)) setShowCitySug(false);
      if (searchBarRef.current && !searchBarRef.current.contains(e.target)) setActiveTab(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function clearAll() { setSq(DEFAULT_SEARCHQ); setBudgetRange([0, 1500000]); setAreaRange([0, 500]); setActiveTab(null); }

  function clearTab(key) {
    if (key === "city") setSq(q => ({ ...q, city: "" }));
    else if (key === "types") setSq(q => ({ ...q, types: [] }));
    else if (key === "budget") setBudgetRange([0, 1500000]);
    else if (key === "surface") setAreaRange([0, 500]);
  }

  const TABS = [
    { key: "city",    label: "Localité" },
    { key: "types",   label: "Type de bien" },
    { key: "budget",  label: "Budget" },
    { key: "surface", label: "Surface min (m²)" },
  ];

  return (
    <div ref={searchBarRef}>
      {/* ── Collapsed pill bar ── */}
      <div style={{ background: "#fff", border: `1px solid ${C.cinder15}`, borderRadius: activeTab ? "16px 16px 0 0" : 99, display: "flex", alignItems: "center", overflow: "hidden", boxShadow: activeTab ? "none" : "0 4px 20px rgba(0,0,0,.12)" }}>
        {TABS.map((t, i) => {
          const isActive = activeTab === t.key;
          const hasValue =
            t.key === "city" ? !!sq.city :
            t.key === "types" ? sq.types.length > 0 :
            t.key === "budget" ? (budgetRange[0] > 0 || budgetRange[1] < 1500000) :
            (areaRange[0] > 0 || areaRange[1] < 500);
          const fmtK = v => v >= 1000 ? Math.round(v / 1000) + "k" : String(v);
          const valueLabel =
            t.key === "city" ? sq.city :
            t.key === "types" ? (sq.types.length === 1 ? TYPE_OPTIONS.find(x => x[0] === sq.types[0])?.[1] : sq.types.length + " types") :
            t.key === "budget" ? (
              budgetRange[0] > 0 && budgetRange[1] < 1500000 ? fmtK(budgetRange[0]) + " – " + fmtK(budgetRange[1]) + " €" :
              budgetRange[0] > 0 ? "≥ " + fmtK(budgetRange[0]) + " €" : "≤ " + fmtK(budgetRange[1]) + " €"
            ) : (
              areaRange[0] > 0 && areaRange[1] < 500 ? areaRange[0] + " – " + areaRange[1] + " m²" :
              areaRange[0] > 0 ? "≥ " + areaRange[0] + " m²" : "≤ " + areaRange[1] + " m²"
            );
          return (
            <button key={t.key} onClick={() => setActiveTab(v => v === t.key ? null : t.key)}
              style={{ position: "relative", flex: 1, height: m.mob ? 52 : 62, padding: hasValue ? "0 22px 0 8px" : "0 8px", border: "none", borderRight: i < TABS.length - 1 ? `1px solid ${C.cinder10}` : "none", background: hasValue ? "rgba(9,38,29,0.07)" : isActive ? "rgba(9,38,29,0.04)" : "transparent", fontFamily: "Urbanist, sans-serif", cursor: "pointer", transition: "background .2s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, overflow: "hidden" }}>
              <span style={{ fontSize: m.mob ? 10 : 11, color: hasValue ? C.abbey : isActive ? C.bush : C.abbey, fontWeight: 400, lineHeight: 1, whiteSpace: "nowrap" }}>{t.label}</span>
              {hasValue && <span style={{ fontSize: m.mob ? 11 : 12, fontWeight: 700, color: C.bush, lineHeight: 1, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{valueLabel}</span>}
              {hasValue && (
                <span onClick={e => { e.stopPropagation(); clearTab(t.key); }}
                  style={{ position: "absolute", top: 7, right: 6, width: 15, height: 15, borderRadius: "50%", background: C.bush, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, cursor: "pointer", lineHeight: 1, flexShrink: 0 }}>✕</span>
              )}
            </button>
          );
        })}
        <button onClick={() => { setActiveTab(null); onSearch(); }} style={{ width: m.mob ? 52 : 62, height: m.mob ? 52 : 62, flexShrink: 0, border: "none", borderLeft: `1px solid ${C.cinder10}`, background: C.cyan, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M9 17A8 8 0 109 1a8 8 0 000 16zM19 19l-4.35-4.35" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* ── Expanded panel ── */}
      {activeTab && (
        <div style={{ background: "#fff", borderRadius: "0 0 16px 16px", boxShadow: "0 16px 48px rgba(0,0,0,.14)", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "flex-end", borderBottom: `1px solid ${C.cinder10}` }}>
            <button onClick={() => setActiveTab(null)} style={{ width: 52, height: 44, flexShrink: 0, border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.abbey }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div style={{ minHeight: 160 }}>
            {activeTab === "city" && (
              <div style={{ padding: "28px 32px" }}>
                <div ref={cityWrapRef} style={{ position: "relative", maxWidth: 400 }}>
                  <input value={sq.city} autoFocus onFocus={() => setShowCitySug(true)}
                    onChange={e => { setSq(q => ({ ...q, city: e.target.value })); setShowCitySug(true); }}
                    placeholder="Saisissez une ville ou un code postal…"
                    style={{ width: "100%", height: 48, borderRadius: 10, border: `1px solid ${C.cinder10}`, padding: "0 14px", fontFamily: "Urbanist, sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box", color: C.mine }} />
                  {showCitySug && citySuggestions.length > 0 && (
                    <div style={{ position: "absolute", left: 0, right: 0, top: 52, background: "#fff", border: `1px solid ${C.cinder15}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.1)", maxHeight: 220, overflowY: "auto", zIndex: 60 }}>
                      {citySuggestions.map(c => (
                        <button key={c} onClick={() => { setSq(q => ({ ...q, city: c })); setShowCitySug(false); }} style={{ width: "100%", textAlign: "left", padding: "11px 14px", border: "none", background: "transparent", cursor: "pointer", fontFamily: "Urbanist, sans-serif", fontSize: 14, color: C.mine }}>{c}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === "types" && (
              <div style={{ padding: "28px 32px", display: "flex", flexWrap: "wrap", gap: 10 }}>
                {TYPE_OPTIONS.map(([key, label]) => {
                  const on = sq.types.includes(key);
                  return (
                    <button key={key} onClick={() => setSq(q => ({ ...q, types: on ? q.types.filter(t => t !== key) : [...q.types, key] }))}
                      style={{ height: 42, padding: "0 20px", borderRadius: 99, border: `1.5px solid ${on ? C.bush : C.cinder15}`, background: on ? C.bush : "transparent", color: on ? "#fff" : C.mine, fontFamily: "Urbanist, sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
            {activeTab === "budget" && (
              <DualRangeSlider min={0} max={1500000} step={10000} valueMin={budgetRange[0]} valueMax={budgetRange[1]} onChange={(lo, hi) => setBudgetRange([lo, hi])} />
            )}
            {activeTab === "surface" && (
              <DualRangeSlider min={0} max={500} step={5} valueMin={areaRange[0]} valueMax={areaRange[1]} onChange={(lo, hi) => setAreaRange([lo, hi])} unit="m²" maxLabel="500+ m²" />
            )}
          </div>
          <div style={{ background: "rgba(9,38,29,0.04)", borderTop: `1px solid ${C.cinder10}`, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
            <button onClick={clearAll} style={{ height: 42, padding: "0 20px", border: "none", background: "transparent", color: C.abbey, fontFamily: "Urbanist, sans-serif", fontSize: 14, fontWeight: 500, cursor: "pointer", borderRadius: 8 }}>Tout effacer</button>
            <button onClick={() => { setActiveTab(null); onSearch(); }} style={{ height: 42, padding: "0 28px", border: "none", background: C.cyan, color: "#fff", fontFamily: "Urbanist, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", borderRadius: 8 }}>Rechercher</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════ HOME ═══════ */
function Home({ props, ld, go, m, px, sq, setSq, budgetRange, setBudgetRange, areaRange, setAreaRange }) {
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
          <SearchBar sq={sq} setSq={setSq} budgetRange={budgetRange} setBudgetRange={setBudgetRange} areaRange={areaRange} setAreaRange={setAreaRange} allProps={props} onSearch={() => go("annonces")} m={m} />
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
function Annonces({ props, ld, go, m, px, sq, setSq, budgetRange, setBudgetRange, areaRange, setAreaRange }) {
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  /* Live filtering from shared search state */
  const fl = props.filter(p => {
    const pt = norm(p.type || p.subtype || "");
    if (sq.city && !norm(p.city).includes(norm(sq.city))) return false;
    if (sq.types.length > 0) {
      const matched = sq.types.some(t => {
        if (t === "maison") return /maison|villa/i.test(pt);
        if (t === "appart") return /appart|studio|duplex/i.test(pt);
        if (t === "terrain") return /terrain/i.test(pt);
        return false;
      });
      if (!matched) return false;
    }
    if (budgetRange[0] > 0 && p.price < budgetRange[0]) return false;
    if (budgetRange[1] < 1500000 && p.price > budgetRange[1]) return false;
    const area = p.area?.value || p.area?.total || 0;
    if (areaRange[0] > 0 && area < areaRange[0]) return false;
    if (areaRange[1] < 500 && area > areaRange[1]) return false;
    return true;
  });

  /* Reset page when search changes */
  useEffect(() => { setPage(1); }, [sq, budgetRange, areaRange]);

  const totalPages = Math.max(1, Math.ceil(fl.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = fl.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const goPage = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const pageNums = [];
  const maxVisible = m.mob ? 3 : 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pageNums.push(i);

  const hasFilters = sq.city || sq.types.length > 0 || budgetRange[0] > 0 || budgetRange[1] < 1500000 || areaRange[0] > 0 || areaRange[1] < 500;

  return (
    <main style={{ paddingTop: m.mob ? 80 : 120 }}>
      <div style={{ background: C.bush, padding: `24px ${px} 24px` }} />

      <section style={{ padding: `40px ${px} 80px`, maxWidth: 1440, margin: "0 auto" }}>
        <Rv>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            <h1 style={{ fontSize: m.mob ? 30 : m.tab ? 44 : 60, fontWeight: 500, color: C.bush, lineHeight: 1.15, margin: 0 }}>Nos propriétés</h1>
            <span style={{ fontSize: m.mob ? 15 : 17, color: C.abbey }}>
              {ld ? "Chargement..." : `${fl.length} bien${fl.length > 1 ? "s" : ""} trouvé${fl.length > 1 ? "s" : ""}${hasFilters ? " (filtré)" : ""}`}
            </span>
          </div>
        </Rv>
        <Rv>
          <div style={{ marginBottom: 32 }}>
            <FilterBar sq={sq} setSq={setSq} budgetRange={budgetRange} setBudgetRange={setBudgetRange} areaRange={areaRange} setAreaRange={setAreaRange} allProps={props} onSearch={() => {}} m={m} />
          </div>
        </Rv>

        {/* Empty state */}
        {!ld && fl.length === 0 && (
          <Rv>
            <div style={{ textAlign: "center", padding: "60px 0", color: C.abbey }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Aucun bien ne correspond à vos critères.</p>
              <button onClick={() => { setSq(DEFAULT_SEARCHQ); setBudgetRange([0, 1500000]); setAreaRange([0, 500]); }} style={{ marginTop: 12, height: 44, padding: "0 24px", borderRadius: 10, border: "none", background: C.cyan, color: "#fff", fontFamily: "Urbanist, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Effacer les filtres</button>
            </div>
          </Rv>
        )}

        <div style={{ display: "grid", gridTemplateColumns: m.mob ? "1fr 1fr" : m.tab ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: m.mob ? 16 : 28 }}>
          {!ld && paginated.map((p, i) => (
            <Rv key={p.id} d={Math.min(i % 3 + 1, 3)}><PropCard p={p} idx={i} mob={m.mob} onClick={() => go("bien", p.id)} /></Rv>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: m.mob ? 6 : 10, marginTop: m.mob ? 40 : 56 }}>
            <button onClick={() => goPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
              style={{ width: m.mob ? 36 : 44, height: m.mob ? 36 : 44, borderRadius: 12, border: `1px solid ${C.cinder10}`, background: "transparent", cursor: currentPage === 1 ? "default" : "pointer", opacity: currentPage === 1 ? .3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={C.mine} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {start > 1 && (<><button onClick={() => goPage(1)} style={pgBtnStyle(1 === currentPage, m.mob)}>1</button>{start > 2 && <span style={{ fontSize: 14, color: C.abbey }}>…</span>}</>)}
            {pageNums.map(n => (<button key={n} onClick={() => goPage(n)} style={pgBtnStyle(n === currentPage, m.mob)}>{n}</button>))}
            {end < totalPages && (<>{end < totalPages - 1 && <span style={{ fontSize: 14, color: C.abbey }}>…</span>}<button onClick={() => goPage(totalPages)} style={pgBtnStyle(totalPages === currentPage, m.mob)}>{totalPages}</button></>)}
            <button onClick={() => goPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
              style={{ width: m.mob ? 36 : 44, height: m.mob ? 36 : 44, borderRadius: 12, border: `1px solid ${C.cinder10}`, background: "transparent", cursor: currentPage === totalPages ? "default" : "pointer", opacity: currentPage === totalPages ? .3 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={C.mine} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        )}
        {totalPages > 1 && <div style={{ textAlign: "center", marginTop: 12, fontSize: 14, color: C.abbey }}>Page {currentPage} sur {totalPages}</div>}

        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a onClick={() => go("home")} style={{ fontSize: 16, color: C.abbey, cursor: "pointer", textDecoration: "underline" }}>← Retour à l'accueil</a>
        </div>
      </section>
      <Footer go={go} m={m} px={px} />
    </main>
  );
}

/* Pagination button style */
function pgBtnStyle(active, mob) {
  return {
    width: mob ? 36 : 44, height: mob ? 36 : 44, borderRadius: 12,
    border: active ? "none" : `1px solid ${C.cinder10}`,
    background: active ? C.cyan : "transparent",
    color: active ? C.white : C.mine,
    fontFamily: "Urbanist, sans-serif", fontSize: mob ? 14 : 16, fontWeight: 500,
    cursor: "pointer", transition: "all .2s",
    display: "flex", alignItems: "center", justifyContent: "center",
  };
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
                  p.condition && ["État", p.condition],
                  p.availability && ["Disponibilité", p.availability],
                  area > 0 && ["Surfaces", `${area} m²`],
                  p.area?.total > 0 && p.area.total !== area && ["Surface terrain", `${p.area.total} m²`],
                  ["Prix", `€ ${Number(p.price).toLocaleString("fr-FR")}`],
                  p.rooms > 0 && ["Pièces", p.rooms],
                  p.bedrooms > 0 && ["Chambres", p.bedrooms],
                  p.bathrooms > 0 && ["Salles de bains", p.bathrooms],
                  p.heating && ["Chauffage", p.heating],
                  p.reference && ["Référence", p.reference],
                ].filter(Boolean).map(([label, value], i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.cinder10}` }}>
                    <span style={{ fontSize: 15, color: C.abbey }}>{label}:</span>
                    <span style={{ fontSize: 15, fontWeight: 500, color: C.mine }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prestations section */}
            {p.services && p.services.length > 0 && (
              <div style={{ borderTop: `1px solid ${C.cinder10}`, paddingTop: 28, marginTop: 8 }}>
                <h2 style={{ fontSize: m.mob ? 20 : 24, fontWeight: 600, color: C.bush, marginBottom: 20 }}>Prestations</h2>
                <div style={{ display: "grid", gridTemplateColumns: m.mob ? "1fr" : "1fr 1fr", gap: "10px 40px" }}>
                  {p.services.map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={C.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span style={{ fontSize: 15, color: C.mine, textTransform: "capitalize" }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Details — Google Maps */}
            {(p.latitude && p.longitude) && (
              <div style={{ borderTop: `1px solid ${C.cinder10}`, paddingTop: 28, marginTop: 8 }}>
                <h2 style={{ fontSize: m.mob ? 20 : 24, fontWeight: 600, color: C.bush, marginBottom: 20 }}>Location Details</h2>
                <div style={{ borderRadius: 12, overflow: "hidden", marginBottom: 12, position: "relative" }}>
                  <iframe
                    title="Map"
                    width="100%"
                    height={m.mob ? 250 : 380}
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${p.latitude},${p.longitude}&z=15&output=embed`}
                  />
                  <a href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`} target="_blank" rel="noopener noreferrer"
                    style={{ position: "absolute", top: 12, left: 12, background: "#fff", border: `1px solid ${C.cinder10}`, borderRadius: 8, padding: "6px 14px", fontSize: 14, color: C.cyan, fontWeight: 500, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
                    Open in Maps
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" stroke={C.cyan} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: C.abbey }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={C.abbey} strokeWidth="1.5"/><circle cx="12" cy="10" r="3" stroke={C.abbey} strokeWidth="1.5"/></svg>
                  FR, Calvados, {p.city}
                </div>
              </div>
            )}

            {/* Réglementation (DPE / GES) */}
            {p.regulations && Object.keys(p.regulations).length > 0 && (
              <div style={{ borderTop: `1px solid ${C.cinder10}`, paddingTop: 28, marginTop: 8 }}>
                <h2 style={{ fontSize: m.mob ? 20 : 24, fontWeight: 600, color: C.bush, marginBottom: 20 }}>RÉGLEMENTATION :</h2>
                <div style={{ display: "grid", gridTemplateColumns: m.mob ? "1fr" : "1fr 1fr", gap: 0 }}>
                  {Object.entries(p.regulations).map(([key, value], i) => {
                    const label = key.replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase());
                    const displayVal = typeof value === "object" ? JSON.stringify(value) : String(value);
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.cinder10}` }}>
                        <span style={{ fontSize: 15, color: C.abbey }}>{label}</span>
                        <span style={{ fontSize: 15, fontWeight: 500, color: C.mine }}>{displayVal}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
            {/* Agent card — cyan background like ebimmo.com */}
            <div style={{ background: C.cyan, borderRadius: 16, padding: m.mob ? 16 : 24, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                {p.agent?.photo ? (
                  <img src={p.agent.photo} alt={p.agent.name} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "3px solid #fff" }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.bush, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 600, border: "3px solid #fff" }}>EB</div>
                )}
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                    {p.agent?.name || "E&B Immo"}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fill="#fff" stroke="#fff" strokeWidth="1"/></svg>
                  </div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,.85)" }}>Agence immobilière</div>
                </div>
              </div>
              <a href={`mailto:${p.agent?.email || "contact@eb-immo.fr"}`} style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 8, padding: "10px 18px", fontSize: 15, fontWeight: 500, color: C.cyan, textDecoration: "none", whiteSpace: "nowrap" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke={C.cyan} strokeWidth="1.5"/><polyline points="22,6 12,13 2,6" stroke={C.cyan} strokeWidth="1.5"/></svg>
                Send Email
              </a>
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
