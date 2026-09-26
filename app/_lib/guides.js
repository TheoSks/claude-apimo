export const GUIDES = [
  {
    slug: "prix-au-m2-cote-fleurie-2026",
    title: "Prix au m² sur la Côte Fleurie en 2026",
    description:
      "Analyse des prix de l'immobilier à Cabourg, Merville-Franceville, Bavent, Troarn, Petiville et alentours en 2026. Évolution, tendances et conseils d'expert E&B Immo.",
    date: "2026-01-15",
    excerpt:
      "Tour d'horizon des prix au m² ville par ville sur la Côte Fleurie, des écarts entre première ligne mer et arrière-pays, et des leviers qui font monter ou baisser la valeur d'un bien.",
    body: [
      { h2: "Un marché normand toujours porteur" },
      {
        p: `La Côte Fleurie reste l'un des marchés résidentiels les plus prisés de la façade Manche. La proximité de Paris (à 2 h via l'A13), la rareté du foncier de bord de mer et la stabilité de la demande en résidence secondaire soutiennent durablement les valeurs.`,
      },
      { h2: "Prix au m² par ville (estimations 2026)" },
      {
        p: `Cabourg : 4 500 à 7 000 €/m² selon l'emplacement (front de mer, centre, quartiers résidentiels). Merville-Franceville-Plage : 3 500 à 5 500 €/m². Houlgate : 3 800 à 6 000 €/m². Petiville et Bavent : 2 600 à 3 800 €/m². Troarn : 2 300 à 3 300 €/m². Ces fourchettes varient fortement selon la vue, l'état, le terrain et la prestation.`,
      },
      { h2: "Les leviers de valorisation" },
      {
        p: `Vue mer directe, accès rapide à la plage, parking ou garage en centre-ville, performance énergétique (DPE C ou mieux), terrain et exposition sud-ouest : autant de critères qui peuvent ajouter 15 à 40 % à la valeur d'un bien équivalent.`,
      },
      { h2: "Faire estimer son bien" },
      {
        p: `Notre estimation gratuite en ligne ou en agence prend en compte les transactions récentes ville par ville et les spécificités de votre bien. Contactez E&B Immo pour un avis de valeur fiable.`,
      },
    ],
  },
  {
    slug: "acheter-residence-secondaire-cabourg",
    title: "Acheter une résidence secondaire à Cabourg : le guide complet",
    description:
      "Tout savoir pour acheter une résidence secondaire à Cabourg et alentours : secteurs, budget, fiscalité, conseils E&B Immo.",
    date: "2026-02-10",
    excerpt:
      "Quartiers à privilégier, budget réaliste, fiscalité, location saisonnière : le guide complet pour réussir l'achat de votre résidence secondaire à Cabourg.",
    body: [
      { h2: "Choisir son secteur à Cabourg et alentours" },
      {
        p: `Le front de mer et le centre de Cabourg, autour de la Promenade Marcel-Proust, offrent l'accès le plus rapide à la plage mais avec les prix les plus élevés. Merville-Franceville-Plage séduit par ses dunes et ses grandes plages. Pour plus d'espace à budget maîtrisé, Petiville, Bavent et Varaville proposent des maisons avec jardin à quelques minutes de la mer.`,
      },
      { h2: "Quel budget prévoir ?" },
      {
        p: `À Cabourg, un studio bien placé se négocie autour de 120 à 200 k€ et un 2/3 pièces entre 200 et 400 k€. Une maison familiale dans les communes voisines (Petiville, Bavent, Troarn) démarre autour de 250 k€, tandis que les villas proches de la mer dépassent souvent 600 k€.`,
      },
      { h2: "Fiscalité et location saisonnière" },
      {
        p: `La location saisonnière permet de rentabiliser une partie des charges. Pensez à la taxe foncière, à la taxe d'habitation sur résidence secondaire (majorée dans certaines communes littorales), et au régime LMNP qui peut être avantageux. Un expert-comptable spécialisé est souvent rentable dès la première année.`,
      },
      { h2: "Se faire accompagner" },
      {
        p: `E&B Immo accompagne acquéreurs et investisseurs à Cabourg, Bavent, Troarn, Merville-Franceville, Petiville et sur toute la Côte Fleurie. Visites ciblées, négociation, mise en location : un interlocuteur unique pour sécuriser votre projet.`,
      },
    ],
  },
  {
    slug: "vendre-vite-cote-fleurie",
    title: "Vendre vite et bien son bien sur la Côte Fleurie",
    description:
      "Conseils pratiques pour vendre rapidement son bien immobilier à Cabourg, Bavent, Troarn, Merville-Franceville, Petiville et sur la Côte Fleurie au meilleur prix.",
    date: "2026-03-05",
    excerpt:
      "Estimation juste, photos professionnelles, diagnostics, mise en valeur : les bonnes pratiques pour vendre rapidement sur la Côte Fleurie.",
    body: [
      { h2: "Une estimation juste, point de départ" },
      {
        p: `Surévaluer son bien est la première cause d'échec d'une vente. Un prix juste, basé sur les transactions récentes du quartier, attire les acquéreurs dès la mise en ligne — la période la plus performante d'une annonce.`,
      },
      { h2: "Investir dans la mise en valeur" },
      {
        p: `Photos professionnelles, visite virtuelle, home staging léger : ces investissements modestes (500 à 2 000 €) peuvent réduire le délai de vente de plusieurs mois et limiter les négociations à la baisse.`,
      },
      { h2: "Diagnostics et DPE" },
      {
        p: `Tous les diagnostics doivent être disponibles avant la première visite. Un DPE défavorable (F ou G) peut être un frein : envisager des travaux ciblés (isolation, chauffage) avant mise en vente est parfois plus rentable que de subir une décote.`,
      },
      { h2: "Choisir son agence" },
      {
        p: `E&B Immo combine ancrage local sur la Côte Fleurie et diffusion digitale puissante. Mandat exclusif, transparence sur le suivi des visites, retours acquéreurs : nos clients vendent en moyenne plus vite que la moyenne du marché.`,
      },
    ],
  },
];

export function findGuide(slug) {
  return GUIDES.find((g) => g.slug === slug);
}
