import { Resend } from "resend";

/* Destinataires des demandes (contact + estimation). Surchargeable sur Vercel via CONTACT_EMAIL. */
export const TEAM_EMAILS = process.env.CONTACT_EMAIL
  ? process.env.CONTACT_EMAIL.split(",").map((s) => s.trim()).filter(Boolean)
  : ["gaggio880@gmail.com", "contact@eb-immo.fr"];

/* Expéditeur. "onboarding@resend.dev" est l'adresse de test de Resend : elle ne peut écrire
   qu'au propriétaire du compte Resend. Une fois le domaine eb-immo.fr validé dans Resend,
   définir RESEND_FROM sur Vercel (ex. "E&B Immo <site@eb-immo.fr>"). */
const FROM = process.env.RESEND_FROM || "EB Immo <onboarding@resend.dev>";

/* Envoie le message à l'équipe. Si Resend refuse l'envoi groupé (un seul destinataire
   refusé fait échouer tout le lot), on réessaie adresse par adresse pour qu'au moins
   les destinataires autorisés reçoivent la demande. */
export async function sendToTeam({ subject, html, replyTo }) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const send = (to) => resend.emails.send({ from: FROM, to, replyTo, subject, html });

  const all = await send(TEAM_EMAILS);
  if (!all.error) return { ok: true, delivered: TEAM_EMAILS };
  console.error("Resend (envoi groupé) :", all.error);

  const delivered = [];
  for (const to of TEAM_EMAILS) {
    const r = await send([to]);
    if (r.error) console.error(`Resend (${to}) :`, r.error);
    else delivered.push(to);
  }
  return { ok: delivered.length > 0, delivered };
}
