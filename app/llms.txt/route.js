import { CITIES } from "../_lib/cities";
import { BUCKETS } from "../_lib/buckets";
import { GUIDES } from "../_lib/guides";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ebimmo.com";

export const revalidate = 3600;

/**
 * llms.txt — guide les moteurs de réponse IA (ChatGPT, Perplexity, Claude,
 * Gemini…) vers les pages et informations clés du site.
 * Format inspiré de la proposition https://llmstxt.org
 */
export async function GET() {
  const lines = [];

  lines.push("# E&B Immo");
  lines.push("");
  lines.push(
    "> Agence immobilière indépendante de la Côte Fleurie (Normandie), fondée en 2017 par Emeline Burel et Benjamin. E&B Immo accompagne l'achat, la vente, la location, le viager et l'estimation de biens à Deauville, Trouville-sur-Mer, Honfleur, Cabourg, Houlgate, Villers-sur-Mer, Blonville-sur-Mer et Varaville."
  );
  lines.push("");
  lines.push("## Coordonnées");
  lines.push("- Adresse : 3 place du Commerce, 14860 Bavent (Calvados, Normandie)");
  lines.push("- Téléphone : +33 7 60 95 36 18");
  lines.push("- Email : contact@eb-immo.fr");
  lines.push("- Zone couverte : Côte Fleurie, Calvados, Normandie");
  lines.push("");
  lines.push("## Services");
  lines.push("- Vente de maisons, appartements, villas, terrains, immeubles et locaux commerciaux");
  lines.push("- Location longue durée et location saisonnière");
  lines.push("- Vente et achat en viager (occupé et libre)");
  lines.push("- Estimation immobilière gratuite en ligne et sur place");
  lines.push("");
  lines.push("## Pages principales");
  lines.push(`- [Accueil](${SITE_URL}/): présentation de l'agence et biens en vedette`);
  lines.push(`- [Estimation gratuite](${SITE_URL}/estimation): estimation en ligne en 2 minutes`);
  lines.push(`- [Guides immobiliers](${SITE_URL}/guides): conseils achat, vente et marché`);
  lines.push("");

  lines.push("## Agences par commune");
  for (const c of CITIES) {
    lines.push(`- [Agence immobilière ${c.name} (${c.zipcode})](${SITE_URL}/agence/${c.slug})`);
  }
  lines.push("");

  lines.push("## Pages par secteur et commune");
  for (const b of BUCKETS) {
    for (const c of CITIES) {
      lines.push(`- [${b.h1(c.name)}](${SITE_URL}/immobilier/${b.slug}/${c.slug})`);
    }
  }
  lines.push("");

  lines.push("## Guides");
  for (const g of GUIDES) {
    lines.push(`- [${g.title}](${SITE_URL}/guides/${g.slug}): ${g.description}`);
  }
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
