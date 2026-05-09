import { Resend } from "resend";

const TO_EMAIL = "gaggio880@gmail.com";

const LABELS = {
  typeBien: { maison: "Maison", appartement: "Appartement" },
  refaisNeuf: { oui: "Oui — aucun travaux à prévoir", non: "Non — travaux à prévoir" },
  materiaux: { standard: "Standard", moyen: "Moyen", haut: "Haut de gamme" },
  travaux: {
    electricite: "Électricité", plomberie: "Plomberie", fenetres: "Fenêtres / menuiseries",
    isolation: "Isolation", sols: "Sols", gros_travaux: "Gros œuvre",
    peinture: "Peinture", salle_de_bain: "Salle de bain",
    renovation_cuisine: "Cuisine", autres_petits_travaux: "Autres petits travaux",
  },
  caracs: {
    ascenseur: "Ascenseur", mitoyennete: "Mitoyenneté",
    double_orientation: "Double orientation Est/Ouest", bruit: "Bruit / circulation importants",
  },
  parking: {
    parking_exterieur: "Place de parking extérieure",
    parking_sous_sol: "Place de parking sous-sol",
    garage: "Garage",
  },
  annexes: {
    terrasse: "Terrasse / Balcon", cave: "Cave", terrain: "Terrain",
    piscine: "Piscine", jardin: "Jardin",
  },
  vue: {
    vis_a_vis_important: "Vis-à-vis important", sans_vis_a_vis: "Sans vis-à-vis",
    belle_vue: "Belle vue", tres_belle_vue: "Très belle vue",
    vue_exceptionnelle: "Vue exceptionnelle",
  },
};

function fmtP(n) {
  return Number(n).toLocaleString("fr-FR") + " €";
}

function row(label, value) {
  if (!value && value !== 0) return "";
  return `<tr>
    <td style="padding:10px 16px;border-bottom:1px solid #eee;color:#56595A;width:40%;font-size:14px;">${label}</td>
    <td style="padding:10px 16px;border-bottom:1px solid #eee;font-size:14px;color:#222;">${value}</td>
  </tr>`;
}

function sectionHead(title) {
  return `<tr><td colspan="2" style="background:#09261D;padding:10px 16px;font-weight:700;color:#fff;font-size:13px;letter-spacing:0.5px;text-transform:uppercase;">${title}</td></tr>`;
}

export async function POST(request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const body = await request.json();
    const {
      nom, prenom, email, telephone,
      adresse, cp, ville,
      typeBien, surface, nbPieces, nbChambres, nbSalleBain, etage, nbEtages,
      connaitAnnee, anneeConstruction,
      refaisNeuf, travaux,
      materiaux, caracs, parking,
      annexes, vue,
      estimateLow, estimateHigh, estimateCenter,
    } = body;

    if (!nom || !prenom || !email || !telephone) {
      return Response.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const travauxList = Array.isArray(travaux) ? travaux.map(k => LABELS.travaux[k] || k).join(", ") : "";
    const caracsList = Array.isArray(caracs) ? caracs.map(k => LABELS.caracs[k] || k).join(", ") : "";
    const annexesList = Array.isArray(annexes) ? annexes.map(k => LABELS.annexes[k] || k).join(", ") : "";

    const etageStr = etage !== undefined && etage !== ""
      ? `${etage}${nbEtages ? ` / ${nbEtages} étages` : ""}`
      : "";

    const hasEstimate = estimateLow && estimateHigh;

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:Arial,sans-serif;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#09261D;padding:28px 32px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:40px;height:40px;border-radius:50%;background:#24AFC5;display:flex;align-items:center;justify-content:center;">
          <span style="color:#fff;font-size:20px;">🏠</span>
        </div>
        <div>
          <div style="color:#24AFC5;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px;">E&amp;B Immo</div>
          <div style="color:#fff;font-size:20px;font-weight:700;">Nouvelle demande d'estimation</div>
        </div>
      </div>
      <p style="color:rgba(255,255,255,0.65);font-size:13px;margin:14px 0 0;">
        Reçu le ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>

    ${hasEstimate ? `
    <!-- Estimate highlight -->
    <div style="background:linear-gradient(135deg,#09261D,#0d3a2b);padding:28px 32px;text-align:center;">
      <div style="color:rgba(255,255,255,0.7);font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Estimation calculée</div>
      <div style="color:#fff;font-size:32px;font-weight:700;line-height:1.2;">
        ${fmtP(estimateLow)} <span style="color:#24AFC5;">—</span> ${fmtP(estimateHigh)}
      </div>
      <div style="color:rgba(255,255,255,0.65);font-size:14px;margin-top:8px;">
        Valeur centrale : <strong style="color:#24AFC5;">${fmtP(estimateCenter)}</strong>
      </div>
      <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:6px;">Estimation indicative — à affiner avec l'agent</div>
    </div>` : ""}

    <!-- Details table -->
    <div style="padding:24px 32px 32px;">
      <table style="width:100%;border-collapse:collapse;">

        ${sectionHead("👤 Coordonnées du demandeur")}
        ${row("Nom complet", `${prenom} ${nom}`)}
        ${row("Email", `<a href="mailto:${email}" style="color:#24AFC5;">${email}</a>`)}
        ${row("Téléphone", `<a href="tel:${telephone}" style="color:#24AFC5;">${telephone}</a>`)}

        ${sectionHead("📍 Bien à estimer")}
        ${row("Adresse", adresse)}
        ${row("Code postal", cp)}
        ${row("Ville", ville)}
        ${row("Type de bien", LABELS.typeBien[typeBien] || typeBien)}
        ${row("Surface", surface ? `${surface} m²` : "")}
        ${row("Nombre de pièces", nbPieces)}
        ${row("Chambres", nbChambres)}
        ${row("Salles de bain", nbSalleBain)}
        ${etageStr ? row("Étage", etageStr) : ""}

        ${sectionHead("🔨 État du bien")}
        ${row("Année de construction", anneeConstruction || (connaitAnnee === false ? "Inconnue" : ""))}
        ${row("Refait à neuf", LABELS.refaisNeuf[refaisNeuf] || refaisNeuf)}
        ${travauxList ? row("Travaux à prévoir", travauxList) : ""}

        ${sectionHead("✨ Standing & équipements")}
        ${row("Qualité des matériaux", LABELS.materiaux[materiaux] || materiaux)}
        ${caracsList ? row("Caractéristiques", caracsList) : ""}
        ${parking ? row("Stationnement", LABELS.parking[parking] || parking) : ""}
        ${annexesList ? row("Annexes", annexesList) : ""}
        ${row("Vue / vis-à-vis", LABELS.vue[vue] || vue)}

      </table>

      <!-- CTA -->
      <div style="margin-top:28px;padding:18px 20px;background:#f8f9f6;border-radius:10px;border-left:4px solid #24AFC5;">
        <p style="margin:0;font-size:14px;color:#56595A;line-height:1.6;">
          <strong style="color:#09261D;">Action recommandée :</strong><br />
          Contactez <strong>${prenom} ${nom}</strong> au <a href="tel:${telephone}" style="color:#24AFC5;">${telephone}</a>
          ou par email à <a href="mailto:${email}" style="color:#24AFC5;">${email}</a>
          pour confirmer l'estimation et proposer un rendez-vous.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f4f4f0;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">Envoyé automatiquement depuis eb-immo.fr</p>
    </div>
  </div>
</body>
</html>`;

    const { error } = await resend.emails.send({
      from: "EB Immo <onboarding@resend.dev>",
      to: [TO_EMAIL],
      replyTo: email,
      subject: `🏠 Estimation — ${prenom} ${nom} — ${adresse ? adresse + ", " : ""}${cp} ${ville}`,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Estimation route error:", err);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
