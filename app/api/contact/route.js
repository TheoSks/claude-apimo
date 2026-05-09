import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = "gaggio880@gmail.com";

export async function POST(request) {
  try {
    const body = await request.json();
    const { nom, prenom, email, telephone, adresse, ville, codePostal, typeBien, superficie, nbChambres, anneeConstruction } = body;

    if (!nom || !prenom || !email || !telephone || !ville || !codePostal) {
      return Response.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Adresse email invalide" }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: "EB Immo <onboarding@resend.dev>",
      to: [TO_EMAIL],
      replyTo: email,
      subject: `Nouveau contact EB Immo — ${prenom} ${nom}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #09261D; margin-bottom: 4px;">Nouveau message de contact</h2>
          <p style="color: #56595A; margin-top: 0; margin-bottom: 24px; font-size: 14px;">Reçu via le formulaire eb-immo.fr</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td colspan="2" style="background: #f5f5f5; padding: 10px 14px; font-weight: bold; color: #09261D;">Coordonnées</td></tr>
            <tr><td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #56595A; width: 40%;">Nom</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${prenom} ${nom}</td></tr>
            <tr><td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #56595A;">Email</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #24AFC5;">${email}</a></td></tr>
            <tr><td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #56595A;">Téléphone</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;"><a href="tel:${telephone}" style="color: #24AFC5;">${telephone}</a></td></tr>
            ${adresse ? `<tr><td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #56595A;">Adresse</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${adresse}</td></tr>` : ""}
            <tr><td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #56595A;">Ville</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${codePostal} ${ville}</td></tr>
            <tr><td colspan="2" style="background: #f5f5f5; padding: 10px 14px; font-weight: bold; color: #09261D;">Projet immobilier</td></tr>
            ${typeBien ? `<tr><td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #56595A;">Type de bien</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${typeBien}</td></tr>` : ""}
            ${superficie ? `<tr><td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #56595A;">Superficie</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${superficie} m²</td></tr>` : ""}
            ${nbChambres ? `<tr><td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #56595A;">Nb chambres</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${nbChambres}</td></tr>` : ""}
            ${anneeConstruction ? `<tr><td style="padding: 10px 14px; border-bottom: 1px solid #eee; color: #56595A;">Année construction</td><td style="padding: 10px 14px; border-bottom: 1px solid #eee;">${anneeConstruction}</td></tr>` : ""}
          </table>
          <p style="margin-top: 24px; font-size: 12px; color: #999;">Envoyé automatiquement depuis eb-immo.fr</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return Response.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
