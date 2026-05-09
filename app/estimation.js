"use client";
import React, { useState, useRef } from "react";

const C = {
  bush: "#09261D",
  cyan: "#24AFC5",
  white: "#FFFFFF",
  abbey: "#56595A",
  mine: "#222222",
  cinder10: "rgba(13,14,19,0.1)",
  cinder15: "rgba(13,14,19,0.15)",
  bg: "#FAFAF7",
};

const TRAVAUX_GROS = [
  ["electricite", "Électricité"],
  ["plomberie", "Plomberie"],
  ["fenetres", "Fenêtres / menuiseries"],
  ["isolation", "Isolation"],
  ["sols", "Sols"],
  ["gros_travaux", "Gros œuvre"],
];
const TRAVAUX_PETITS = [
  ["peinture", "Peinture"],
  ["salle_de_bain", "Salle de bain"],
  ["renovation_cuisine", "Cuisine"],
  ["autres_petits_travaux", "Autres petits travaux"],
];
const ANNEXES = [
  ["terrasse", "Terrasse / Balcon"],
  ["cave", "Cave"],
  ["terrain", "Terrain"],
  ["piscine", "Piscine"],
  ["jardin", "Jardin"],
];
const CARACS = [
  ["ascenseur", "Ascenseur"],
  ["mitoyennete", "Mitoyenneté"],
  ["double_orientation", "Double orientation Est/Ouest"],
  ["bruit", "Bruit / circulation importants"],
];
const PARKING = [
  ["parking_exterieur", "Place de parking extérieure"],
  ["parking_sous_sol", "Place de parking sous-sol"],
  ["garage", "Garage"],
];
const VIS_VUE = [
  ["vis_a_vis_important", "Vis-à-vis important"],
  ["sans_vis_a_vis", "Sans vis-à-vis"],
  ["belle_vue", "Belle vue"],
  ["tres_belle_vue", "Très belle vue"],
  ["vue_exceptionnelle", "Vue exceptionnelle"],
];

const TOTAL_STEPS = 9;

/* ── Tiny pure helpers ── */
const baseInput = {
  width: "100%",
  padding: "14px 18px",
  border: `1px solid ${C.cinder10}`,
  borderRadius: 12,
  fontFamily: "Urbanist, sans-serif",
  fontSize: 16,
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
};

/* Rough estimate (purely indicative) — produces a price range */
function computeEstimate(f) {
  const s = Number(f.surface) || 0;
  if (!s) return null;
  let pricePerM2 = f.typeBien === "maison" ? 3200 : 3600;
  /* Travaux discount */
  if (f.travaux.includes("gros_travaux")) pricePerM2 *= 0.78;
  else if (f.travaux.length >= 3) pricePerM2 *= 0.88;
  else if (f.travaux.length >= 1) pricePerM2 *= 0.95;
  if (f.refaisNeuf === "oui") pricePerM2 *= 1.08;
  /* Materials */
  if (f.materiaux === "haut") pricePerM2 *= 1.12;
  else if (f.materiaux === "standard") pricePerM2 *= 0.95;
  /* Annexes */
  if (f.annexes.includes("piscine")) pricePerM2 *= 1.08;
  if (f.annexes.includes("jardin")) pricePerM2 *= 1.04;
  if (f.annexes.includes("terrasse")) pricePerM2 *= 1.03;
  /* Vue */
  if (f.vue === "vue_exceptionnelle") pricePerM2 *= 1.15;
  else if (f.vue === "tres_belle_vue") pricePerM2 *= 1.08;
  else if (f.vue === "belle_vue") pricePerM2 *= 1.04;
  if (f.vue === "vis_a_vis_important") pricePerM2 *= 0.96;
  if (f.bruit) pricePerM2 *= 0.95;
  const center = Math.round((pricePerM2 * s) / 1000) * 1000;
  return { low: Math.round((center * 0.92) / 1000) * 1000, high: Math.round((center * 1.08) / 1000) * 1000, center };
}

const fmtP = n => Number(n).toLocaleString("fr-FR") + " €";

/* ════════════════════ ESTIMATION COMPONENT ════════════════════ */
export default function Estimation({ go, m, px }) {
  const [step, setStep] = useState(0); // 0 = landing
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [errors, setErrors] = useState({});
  // Render-driving state only — changes here trigger conditional rendering
  const [f, setF] = useState({
    typeBien: "",
    connaitAnnee: null,
    refaisNeuf: null,
    travaux: [],
    materiaux: "",
    caracs: [],
    parking: "",
    annexes: [],
    vue: "",
    rgpd: false,
  });

  // Text/number values in refs — no re-render on keystroke, no focus loss
  const vals = useRef({
    adresse: "", cp: "", ville: "",
    surface: "", nbPieces: "", nbChambres: "", nbSalleBain: "",
    etage: "", nbEtages: "", anneeConstruction: "",
    nom: "", prenom: "", email: "", telephone: "",
  });

  // Step 2 next-button validation (updated only when Stepper fires onChange)
  const [step2Ready, setStep2Ready] = useState({ surface: false, pieces: false });
  // Year input validity for step 3 next-button
  const [anneeOk, setAnneeOk] = useState(false);
  // Contact info captured at submit time for result display
  const [contactInfo, setContactInfo] = useState({ email: "", telephone: "" });

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const toggleArr = (k, v) => setF(p => ({ ...p, [k]: p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v] }));

  function next() {
    setErrors({});
    setStep(s => Math.min(TOTAL_STEPS, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setErrors({});
    setStep(s => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startEstimation() {
    const e = {};
    if (!vals.current.adresse.trim()) e.adresse = true;
    if (!vals.current.cp.trim()) e.cp = true;
    if (!vals.current.ville.trim()) e.ville = true;
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitFinal() {
    const v = vals.current;
    const e = {};
    if (!v.nom.trim()) e.nom = true;
    if (!v.prenom.trim()) e.prenom = true;
    if (!v.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = true;
    if (!v.telephone.trim()) e.telephone = true;
    if (!f.rgpd) e.rgpd = true;
    if (Object.keys(e).length) { setErrors(e); return; }

    setSending(true);
    try {
      const fullData = { ...f, ...v };
      const est = computeEstimate(fullData);

      const res = await fetch("/api/estimation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: v.nom,
          prenom: v.prenom,
          email: v.email,
          telephone: v.telephone,
          adresse: v.adresse,
          cp: v.cp,
          ville: v.ville,
          typeBien: f.typeBien,
          surface: v.surface,
          nbPieces: v.nbPieces,
          nbChambres: v.nbChambres,
          nbSalleBain: v.nbSalleBain,
          etage: v.etage,
          nbEtages: v.nbEtages,
          connaitAnnee: f.connaitAnnee,
          anneeConstruction: v.anneeConstruction,
          refaisNeuf: f.refaisNeuf,
          travaux: f.travaux,
          materiaux: f.materiaux,
          caracs: f.caracs,
          parking: f.parking,
          annexes: f.annexes,
          vue: f.vue,
          estimateLow: est?.low,
          estimateHigh: est?.high,
          estimateCenter: est?.center,
        }),
      });
      if (!res.ok) throw new Error();
      setContactInfo({ email: v.email, telephone: v.telephone });
      setEstimate(est);
      setSent(true);
      setStep(TOTAL_STEPS);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrors({ submit: "Une erreur est survenue. Réessayez ou contactez-nous." });
    } finally {
      setSending(false);
    }
  }

  /* ── Section title ── */
  const SectionTitle = ({ children }) => (
    <h2 style={{ fontSize: "clamp(22px, 4.5vw, 34px)", fontWeight: 600, color: C.bush, lineHeight: 1.2, marginBottom: m.xs ? 20 : 28, textAlign: "center" }}>
      {children}
    </h2>
  );

  /* ── Big card option (radio-like) ── */
  const BigCard = ({ active, onClick, icon, label, subtitle }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 0,
        padding: m.xs ? "20px 14px" : "32px 24px",
        border: `2px solid ${active ? C.cyan : C.cinder15}`,
        borderRadius: 16,
        background: active ? "rgba(36,175,197,0.08)" : "#fff",
        color: active ? C.bush : C.mine,
        cursor: "pointer",
        fontFamily: "Urbanist, sans-serif",
        textAlign: "center",
        transition: "all .2s",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: m.xs ? 10 : 14,
      }}>
      {icon && (
        <div style={{ width: m.xs ? 48 : 64, height: m.xs ? 48 : 64, borderRadius: "50%", background: active ? C.cyan : "rgba(36,175,197,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: active ? "#fff" : C.cyan, transition: "all .2s" }}>
          {icon}
        </div>
      )}
      <div>
        <div style={{ fontSize: m.xs ? 15 : 18, fontWeight: 600 }}>{label}</div>
        {subtitle && <div style={{ fontSize: m.xs ? 12 : 13, color: C.abbey, marginTop: 4 }}>{subtitle}</div>}
      </div>
    </button>
  );

  /* ── Pill choice (for groups of options) ── */
  const Pill = ({ active, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "12px 20px",
        border: `1.5px solid ${active ? C.cyan : C.cinder15}`,
        borderRadius: 99,
        background: active ? C.cyan : "#fff",
        color: active ? "#fff" : C.mine,
        fontFamily: "Urbanist, sans-serif",
        fontSize: m.xs ? 13 : 14,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all .2s",
        whiteSpace: "nowrap",
      }}>
      {children}
    </button>
  );

  /* ── Number stepper (self-contained — prevents parent re-render / focus loss) ── */
  const Stepper = ({ label, initValue = "", onChange, min = 0, suffix }) => {
    const [val, setVal] = useState(String(initValue));
    const update = newVal => { const s = String(newVal); setVal(s); onChange(s); };
    return (
    <div style={{ flex: 1, minWidth: m.xs ? "100%" : 140 }}>
      <label style={{ display: "block", fontSize: m.xs ? 13 : 14, color: C.abbey, marginBottom: 8, fontWeight: 500 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", height: 50, border: `1px solid ${C.cinder10}`, borderRadius: 12, background: "#fff", overflow: "hidden" }}>
        <button
          type="button"
          onClick={() => update(Math.max(min, (Number(val) || 0) - 1))}
          style={{ width: 44, height: "100%", border: "none", background: "transparent", color: C.bush, cursor: "pointer", fontSize: 20, fontWeight: 500 }}
          aria-label="Diminuer">−</button>
        <input
          type="number"
          value={val}
          onChange={e => { const v = e.target.value.replace(/[^0-9]/g, ""); setVal(v); onChange(v); }}
          min={min}
          style={{ flex: 1, height: "100%", border: "none", textAlign: "center", fontFamily: "Urbanist, sans-serif", fontSize: 16, color: C.mine, outline: "none", minWidth: 0, MozAppearance: "textfield" }}
        />
        <button
          type="button"
          onClick={() => update((Number(val) || 0) + 1)}
          style={{ width: 44, height: "100%", border: "none", background: "transparent", color: C.bush, cursor: "pointer", fontSize: 20, fontWeight: 500 }}
          aria-label="Augmenter">+</button>
        {suffix && <span style={{ paddingRight: 14, fontSize: 13, color: C.abbey }}>{suffix}</span>}
      </div>
    </div>
    );
  };

  /* ── Progress bar ── */
  const Progress = () => {
    if (step === 0 || sent) return null;
    const pct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
    return (
      <div style={{ marginBottom: m.xs ? 24 : 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, fontSize: m.xs ? 13 : 14, color: C.abbey }}>
          <span>Étape {step} / {TOTAL_STEPS - 1}</span>
          <span>{Math.round(pct)} %</span>
        </div>
        <div style={{ width: "100%", height: 6, background: C.cinder10, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: C.cyan, transition: "width .35s ease" }} />
        </div>
      </div>
    );
  };

  /* ── Action bar (back / next / submit) ── */
  const ActionBar = ({ onNext, nextDisabled, nextLabel = "Continuer", showBack = true, isSubmit = false }) => (
    <div style={{ display: "flex", gap: 12, marginTop: m.xs ? 24 : 36, flexDirection: m.xs ? "column-reverse" : "row" }}>
      {showBack && (
        <button
          type="button"
          onClick={back}
          style={{ height: 52, padding: "0 22px", borderRadius: 12, border: `1px solid ${C.cinder15}`, background: "transparent", color: C.abbey, fontFamily: "Urbanist, sans-serif", fontSize: 15, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Retour
        </button>
      )}
      <button
        type="button"
        onClick={onNext || next}
        disabled={nextDisabled || sending}
        style={{ flex: 1, height: 52, borderRadius: 12, border: "none", background: nextDisabled ? "#bdbdbd" : C.cyan, color: "#fff", fontFamily: "Urbanist, sans-serif", fontSize: 16, fontWeight: 600, cursor: nextDisabled || sending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .2s" }}>
        {sending && isSubmit ? "Envoi en cours…" : nextLabel}
        {!sending && <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </button>
    </div>
  );

  /* ════════════════════ RENDER ════════════════════ */

  /* ─── Step 0 : LANDING ─── */
  if (step === 0) {
    return (
      <main style={{ paddingTop: m.xs ? 72 : m.mob ? 80 : 120, background: C.bg, minHeight: "100vh" }}>
        <section style={{ padding: `${m.xs ? 32 : 60}px ${px} ${m.xs ? 60 : 100}px`, maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: m.xs ? 32 : 48 }}>
            <span style={{ display: "inline-block", padding: "6px 16px", background: "rgba(36,175,197,0.1)", color: C.cyan, borderRadius: 99, fontSize: m.xs ? 12 : 13, fontWeight: 600, letterSpacing: 0.5, marginBottom: m.xs ? 16 : 20, textTransform: "uppercase" }}>
              Estimation gratuite
            </span>
            <h1 style={{ fontSize: "clamp(28px, 6.5vw, 56px)", fontWeight: 600, color: C.bush, lineHeight: 1.15, marginBottom: m.xs ? 16 : 20, maxWidth: 780, marginLeft: "auto", marginRight: "auto" }}>
              Vous souhaitez estimer la valeur de votre logement ?
            </h1>
            <p style={{ fontSize: m.xs ? 16 : 20, color: C.abbey, lineHeight: 1.5, maxWidth: 600, margin: "0 auto" }}>
              En seulement 2 minutes, vous recevez<br />une estimation offerte par un agent immobilier local.
            </p>
          </div>

          {/* Address card */}
          <div style={{ background: "#fff", borderRadius: 20, padding: m.xs ? 20 : m.mob ? 28 : 40, boxShadow: "0 12px 40px rgba(9,38,29,0.08)", maxWidth: 720, margin: "0 auto" }}>
            <h2 style={{ fontSize: m.xs ? 17 : 20, fontWeight: 600, color: C.bush, marginBottom: m.xs ? 18 : 24, display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke={C.cyan} strokeWidth="2"/><circle cx="12" cy="10" r="3" stroke={C.cyan} strokeWidth="2"/></svg>
              Quelle est l'adresse du bien ?
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="Ex : 1 rue Jacques Pasquier"
                defaultValue={vals.current.adresse}
                onChange={e => { vals.current.adresse = e.target.value; }}
                style={{ ...baseInput, border: `1px solid ${errors.adresse ? "#e53935" : C.cinder10}` }}
              />
              <div style={{ display: "grid", gridTemplateColumns: m.xs ? "1fr" : "120px 1fr", gap: 12 }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="Code postal"
                  defaultValue={vals.current.cp}
                  onChange={e => { vals.current.cp = e.target.value.replace(/\D/g, "").slice(0, 5); }}
                  style={{ ...baseInput, border: `1px solid ${errors.cp ? "#e53935" : C.cinder10}` }}
                />
                <input
                  type="text"
                  placeholder="Ville"
                  defaultValue={vals.current.ville}
                  onChange={e => { vals.current.ville = e.target.value; }}
                  style={{ ...baseInput, border: `1px solid ${errors.ville ? "#e53935" : C.cinder10}` }}
                />
              </div>
              <button
                type="button"
                onClick={startEstimation}
                style={{ height: 56, marginTop: 8, borderRadius: 12, border: "none", background: C.cyan, color: "#fff", fontFamily: "Urbanist, sans-serif", fontSize: m.xs ? 15 : 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "background .2s" }}>
                Lancer mon estimation
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          {/* Trust row */}
          <div style={{ display: "grid", gridTemplateColumns: m.xs ? "1fr" : "repeat(3, 1fr)", gap: m.xs ? 16 : 24, marginTop: m.xs ? 32 : 56, maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
            {[
              { icon: "M12 6v6l4 2", title: "2 minutes", desc: "Pour répondre à toutes les questions" },
              { icon: "M5 13l4 4L19 7", title: "100% gratuit", desc: "Sans engagement de votre part" },
              { icon: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z", title: "Expertise locale", desc: "Par un agent E&B Immo" },
            ].map((it, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "center", padding: m.xs ? 16 : 20, background: "#fff", borderRadius: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(36,175,197,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={C.cyan} strokeWidth="2" style={{ display: i === 0 ? "block" : "none" }}/><path d={it.icon} stroke={C.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: m.xs ? 14 : 15, fontWeight: 600, color: C.bush }}>{it.title}</div>
                  <div style={{ fontSize: m.xs ? 12 : 13, color: C.abbey, lineHeight: 1.4 }}>{it.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  /* ─── Wizard wrapper for steps 1+ ─── */
  const WizardWrapper = ({ children }) => (
    <main style={{ paddingTop: m.xs ? 72 : m.mob ? 80 : 120, background: C.bg, minHeight: "100vh" }}>
      <section style={{ padding: `${m.xs ? 24 : 40}px ${px} ${m.xs ? 60 : 100}px`, maxWidth: 760, margin: "0 auto" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: m.xs ? 20 : m.mob ? 28 : 40, boxShadow: "0 12px 40px rgba(9,38,29,0.06)" }}>
          <Progress />
          {children}
        </div>
      </section>
    </main>
  );

  /* ─── Step 1 : TYPE DE BIEN ─── */
  if (step === 1) {
    return (
      <WizardWrapper>
        <SectionTitle>De quel type de bien s'agit-il ?</SectionTitle>
        <div style={{ display: "flex", gap: m.xs ? 12 : 20, flexDirection: m.xs ? "column" : "row" }}>
          <BigCard
            active={f.typeBien === "maison"}
            onClick={() => set("typeBien", "maison")}
            label="Maison"
            subtitle="Villa, pavillon…"
            icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M3 12L12 3l9 9M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />
          <BigCard
            active={f.typeBien === "appartement"}
            onClick={() => set("typeBien", "appartement")}
            label="Appartement"
            subtitle="Studio, loft, duplex…"
            icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M4 21V8l8-5 8 5v13M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />
        </div>
        <ActionBar onNext={next} nextDisabled={!f.typeBien} />
      </WizardWrapper>
    );
  }

  /* ─── Step 2 : SURFACE & PIÈCES ─── */
  if (step === 2) {
    const isApart = f.typeBien === "appartement";
    return (
      <WizardWrapper>
        <SectionTitle>Caractéristiques principales</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Stepper label="Surface (m²)" initValue={vals.current.surface} onChange={v => { vals.current.surface = v; setStep2Ready(p => ({ ...p, surface: !!v && Number(v) > 0 })); }} min={1} suffix="m²" />
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Stepper label="Nombre de pièces" initValue={vals.current.nbPieces} onChange={v => { vals.current.nbPieces = v; setStep2Ready(p => ({ ...p, pieces: !!v && Number(v) > 0 })); }} min={1} />
            <Stepper label="Nombre de chambres" initValue={vals.current.nbChambres} onChange={v => { vals.current.nbChambres = v; }} min={0} />
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Stepper label="Salles de bain" initValue={vals.current.nbSalleBain} onChange={v => { vals.current.nbSalleBain = v; }} min={0} />
            {isApart && <Stepper label="Étage du bien" initValue={vals.current.etage} onChange={v => { vals.current.etage = v; }} min={0} />}
            {isApart && <Stepper label="Étages dans l'immeuble" initValue={vals.current.nbEtages} onChange={v => { vals.current.nbEtages = v; }} min={0} />}
          </div>
        </div>
        <ActionBar onNext={next} nextDisabled={!step2Ready.surface || !step2Ready.pieces} />
      </WizardWrapper>
    );
  }

  /* ─── Step 3 : ANNÉE DE CONSTRUCTION ─── */
  if (step === 3) {
    return (
      <WizardWrapper>
        <SectionTitle>Connaissez-vous l'année de construction ?</SectionTitle>
        <div style={{ display: "flex", gap: m.xs ? 12 : 20, marginBottom: 20, flexDirection: m.xs ? "column" : "row" }}>
          <BigCard active={f.connaitAnnee === true} onClick={() => set("connaitAnnee", true)} label="Oui" />
          <BigCard active={f.connaitAnnee === false} onClick={() => { set("connaitAnnee", false); vals.current.anneeConstruction = ""; setAnneeOk(false); }} label="Non" />
        </div>
        {f.connaitAnnee === true && (
          <div>
            <label style={{ display: "block", fontSize: 14, color: C.abbey, marginBottom: 8, fontWeight: 500 }}>Année</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="Ex : 1985"
              defaultValue={vals.current.anneeConstruction}
              onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); vals.current.anneeConstruction = v; setAnneeOk(v.length === 4); }}
              style={baseInput}
            />
          </div>
        )}
        <ActionBar onNext={next} nextDisabled={f.connaitAnnee === null || (f.connaitAnnee === true && !anneeOk)} />
      </WizardWrapper>
    );
  }

  /* ─── Step 4 : ÉTAT / TRAVAUX ─── */
  if (step === 4) {
    return (
      <WizardWrapper>
        <SectionTitle>Le bien est-il refait à neuf ?</SectionTitle>
        <div style={{ display: "flex", gap: m.xs ? 12 : 20, marginBottom: 28, flexDirection: m.xs ? "column" : "row" }}>
          <BigCard active={f.refaisNeuf === "oui"} onClick={() => { set("refaisNeuf", "oui"); set("travaux", []); }} label="Oui" subtitle="Aucun travaux à prévoir" />
          <BigCard active={f.refaisNeuf === "non"} onClick={() => set("refaisNeuf", "non")} label="Non" subtitle="Travaux à prévoir" />
        </div>
        {f.refaisNeuf === "non" && (
          <>
            <h3 style={{ fontSize: m.xs ? 16 : 18, fontWeight: 600, color: C.bush, marginBottom: 14 }}>Quels travaux sont à prévoir ?</h3>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: C.abbey, marginBottom: 10, fontWeight: 500 }}>Gros travaux</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TRAVAUX_GROS.map(([k, l]) => (
                  <Pill key={k} active={f.travaux.includes(k)} onClick={() => toggleArr("travaux", k)}>{l}</Pill>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 13, color: C.abbey, marginBottom: 10, fontWeight: 500 }}>Petits travaux</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TRAVAUX_PETITS.map(([k, l]) => (
                  <Pill key={k} active={f.travaux.includes(k)} onClick={() => toggleArr("travaux", k)}>{l}</Pill>
                ))}
              </div>
            </div>
          </>
        )}
        <ActionBar onNext={next} nextDisabled={f.refaisNeuf === null} />
      </WizardWrapper>
    );
  }

  /* ─── Step 5 : MATÉRIAUX & CARACTÉRISTIQUES ─── */
  if (step === 5) {
    return (
      <WizardWrapper>
        <SectionTitle>Quel est le standing du bien ?</SectionTitle>
        <p style={{ fontSize: 14, color: C.abbey, marginBottom: 14, fontWeight: 500 }}>Qualité des matériaux</p>
        <div style={{ display: "flex", gap: m.xs ? 8 : 14, marginBottom: 28, flexDirection: m.xs ? "column" : "row" }}>
          {[["standard", "Standard"], ["moyen", "Moyen"], ["haut", "Haut de gamme"]].map(([k, l]) => (
            <BigCard key={k} active={f.materiaux === k} onClick={() => set("materiaux", k)} label={l} />
          ))}
        </div>
        <p style={{ fontSize: 14, color: C.abbey, marginBottom: 10, fontWeight: 500 }}>Caractéristiques particulières</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {CARACS.map(([k, l]) => (
            <Pill key={k} active={f.caracs.includes(k)} onClick={() => toggleArr("caracs", k)}>{l}</Pill>
          ))}
        </div>
        <p style={{ fontSize: 14, color: C.abbey, marginBottom: 10, fontWeight: 500 }}>Stationnement</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PARKING.map(([k, l]) => (
            <Pill key={k} active={f.parking === k} onClick={() => set("parking", f.parking === k ? "" : k)}>{l}</Pill>
          ))}
        </div>
        <ActionBar onNext={next} nextDisabled={!f.materiaux} />
      </WizardWrapper>
    );
  }

  /* ─── Step 6 : ANNEXES ─── */
  if (step === 6) {
    return (
      <WizardWrapper>
        <SectionTitle>Le bien dispose-t-il d'annexes ?</SectionTitle>
        <p style={{ fontSize: 14, color: C.abbey, marginBottom: 14, textAlign: "center" }}>Cochez les éléments présents</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {ANNEXES.map(([k, l]) => (
            <Pill key={k} active={f.annexes.includes(k)} onClick={() => toggleArr("annexes", k)}>{l}</Pill>
          ))}
        </div>
        <ActionBar onNext={next} />
      </WizardWrapper>
    );
  }

  /* ─── Step 7 : VIS-À-VIS / VUE ─── */
  if (step === 7) {
    return (
      <WizardWrapper>
        <SectionTitle>Quelle est la vue du bien ?</SectionTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {VIS_VUE.map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => set("vue", f.vue === k ? "" : k)}
              style={{
                padding: "16px 20px",
                border: `2px solid ${f.vue === k ? C.cyan : C.cinder15}`,
                borderRadius: 12,
                background: f.vue === k ? "rgba(36,175,197,0.08)" : "#fff",
                color: f.vue === k ? C.bush : C.mine,
                fontFamily: "Urbanist, sans-serif",
                fontSize: m.xs ? 14 : 15,
                fontWeight: 500,
                cursor: "pointer",
                textAlign: "left",
                transition: "all .2s",
              }}>
              {l}
            </button>
          ))}
        </div>
        <ActionBar onNext={next} nextDisabled={!f.vue} />
      </WizardWrapper>
    );
  }

  /* ─── Step 8 : COORDONNÉES ─── */
  if (step === 8) {
    return (
      <WizardWrapper>
        <SectionTitle>Recevez votre estimation</SectionTitle>
        <p style={{ fontSize: m.xs ? 14 : 15, color: C.abbey, textAlign: "center", marginBottom: m.xs ? 24 : 32, lineHeight: 1.6 }}>
          Renseignez vos coordonnées pour découvrir l'estimation de votre bien.
          <br />Un agent E&B Immo pourra vous recontacter pour affiner le résultat.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: m.xs ? "1fr" : "1fr 1fr", gap: 14 }}>
          <input type="text" placeholder="Nom *" defaultValue={vals.current.nom} onChange={e => { vals.current.nom = e.target.value; }} style={{ ...baseInput, border: `1px solid ${errors.nom ? "#e53935" : C.cinder10}` }} />
          <input type="text" placeholder="Prénom *" defaultValue={vals.current.prenom} onChange={e => { vals.current.prenom = e.target.value; }} style={{ ...baseInput, border: `1px solid ${errors.prenom ? "#e53935" : C.cinder10}` }} />
          <input type="email" placeholder="Email *" defaultValue={vals.current.email} onChange={e => { vals.current.email = e.target.value; }} style={{ ...baseInput, gridColumn: m.xs ? "auto" : "1 / -1", border: `1px solid ${errors.email ? "#e53935" : C.cinder10}` }} />
          <input type="tel" placeholder="Téléphone *" defaultValue={vals.current.telephone} onChange={e => { vals.current.telephone = e.target.value; }} style={{ ...baseInput, gridColumn: m.xs ? "auto" : "1 / -1", border: `1px solid ${errors.telephone ? "#e53935" : C.cinder10}` }} />
        </div>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 18, cursor: "pointer" }}>
          <input type="checkbox" checked={f.rgpd} onChange={e => set("rgpd", e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, accentColor: C.cyan, cursor: "pointer" }} />
          <span style={{ fontSize: m.xs ? 12 : 13, color: C.abbey, lineHeight: 1.5 }}>
            J'accepte que mes données soient utilisées par E&B Immo pour me recontacter au sujet de mon estimation. *
          </span>
        </label>
        {errors.submit && <p style={{ color: "#c0392b", fontSize: 13, marginTop: 12, textAlign: "center" }}>{errors.submit}</p>}
        <ActionBar onNext={submitFinal} nextLabel="Voir mon estimation" isSubmit />
      </WizardWrapper>
    );
  }

  /* ─── Step 9 : RÉSULTAT ─── */
  if (step === TOTAL_STEPS && sent) {
    return (
      <main style={{ paddingTop: m.xs ? 72 : m.mob ? 80 : 120, background: C.bg, minHeight: "100vh" }}>
        <section style={{ padding: `${m.xs ? 32 : 60}px ${px} ${m.xs ? 60 : 100}px`, maxWidth: 760, margin: "0 auto" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: m.xs ? 24 : m.mob ? 32 : 48, boxShadow: "0 12px 40px rgba(9,38,29,0.08)", textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(36,175,197,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke={C.cyan} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h2 style={{ fontSize: "clamp(22px, 4.5vw, 32px)", fontWeight: 600, color: C.bush, lineHeight: 1.25, marginBottom: 12 }}>
              Voici votre estimation
            </h2>
            <p style={{ fontSize: m.xs ? 14 : 15, color: C.abbey, marginBottom: m.xs ? 24 : 32, lineHeight: 1.6 }}>
              Estimation indicative basée sur les éléments transmis.<br />
              Un agent E&B Immo vous contactera pour l'affiner.
            </p>
            {estimate && (
              <div style={{ background: "linear-gradient(135deg, rgba(36,175,197,0.08), rgba(9,38,29,0.04))", borderRadius: 16, padding: m.xs ? 24 : 32, marginBottom: m.xs ? 24 : 32 }}>
                <div style={{ fontSize: m.xs ? 13 : 14, color: C.abbey, marginBottom: 8, fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>Fourchette estimée</div>
                <div style={{ fontSize: "clamp(24px, 6vw, 42px)", fontWeight: 700, color: C.bush, lineHeight: 1.2 }}>
                  {fmtP(estimate.low)} <span style={{ color: C.cyan }}>—</span> {fmtP(estimate.high)}
                </div>
                <div style={{ fontSize: m.xs ? 13 : 14, color: C.abbey, marginTop: 10 }}>
                  Valeur centrale : <strong style={{ color: C.bush }}>{fmtP(estimate.center)}</strong>
                </div>
              </div>
            )}
            <p style={{ fontSize: m.xs ? 13 : 14, color: C.abbey, marginBottom: m.xs ? 20 : 28, lineHeight: 1.6 }}>
              Un email de confirmation a été envoyé à <strong style={{ color: C.mine }}>{contactInfo.email}</strong>.<br />
              Notre agent prendra contact avec vous au <strong style={{ color: C.mine }}>{contactInfo.telephone}</strong> sous peu.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => go("annonces")}
                style={{ height: 48, padding: "0 24px", borderRadius: 99, border: `1px solid ${C.cyan}`, background: "transparent", color: C.cyan, fontFamily: "Urbanist, sans-serif", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
                Découvrir nos biens
              </button>
              <button
                type="button"
                onClick={() => go("contact")}
                style={{ height: 48, padding: "0 24px", borderRadius: 99, border: "none", background: C.cyan, color: "#fff", fontFamily: "Urbanist, sans-serif", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Prendre rendez-vous
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return null;
}
