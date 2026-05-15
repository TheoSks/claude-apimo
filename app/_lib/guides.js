export const GUIDES = [
  {
    slug: "prix-au-m2-cote-fleurie-2026",
    title: "Prix au m² sur la Côte Fleurie en 2026",
    description:
      "Analyse des prix de l'immobilier à Deauville, Trouville, Honfleur, Cabourg et alentours en 2026. Évolution, tendances et conseils d'expert E&B Immo.",
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
        p: `Deauville : 7 000 à 12 000 €/m² selon l'emplacement (centre, Planches, quartier Coteaux). Trouville-sur-Mer : 5 500 à 9 000 €/m². Honfleur : 5 000 à 8 500 €/m² (cœur historique premium). Cabourg : 5 000 à 8 000 €/m². Houlgate et Villers-sur-Mer : 4 500 à 7 500 €/m². Ces fourchettes varient fortement selon la vue, l'état et la prestation.`,
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
    slug: "acheter-residence-secondaire-deauville",
    title: "Acheter une résidence secondaire à Deauville : le guide complet",
    description:
      "Tout savoir pour acheter une résidence secondaire à Deauville : quartiers, budget, fiscalité, conseils E&B Immo.",
    date: "2026-02-10",
    excerpt:
      "Quartiers à privilégier, budget réaliste, fiscalité, location saisonnière : le guide complet pour réussir l'achat de votre résidence secondaire à Deauville.",
    body: [
      { h2: "Choisir son quartier à Deauville" },
      {
        p: `Le centre-ville et la zone des Planches offrent l'accès le plus rapide à la mer mais avec les prix les plus élevés. Le quartier des Coteaux séduit par ses villas anglo-normandes et son calme. Le secteur du Mont Canisy combine vue panoramique et environnement préservé.`,
      },
      { h2: "Quel budget prévoir ?" },
      {
        p: `Pour un studio bien placé, comptez 250 à 400 k€. Un 2/3 pièces avec parking se situe entre 450 et 800 k€. Les villas familiales démarrent autour de 1,2 M€ et peuvent dépasser 5 M€ pour les biens d'exception.`,
      },
      { h2: "Fiscalité et location saisonnière" },
      {
        p: `La location saisonnière permet de rentabiliser une partie des charges. Pensez à la taxe foncière, à la taxe d'habitation sur résidence secondaire (majorée à Deauville), et au régime LMNP qui peut être avantageux. Un expert-comptable spécialisé est souvent rentable dès la première année.`,
      },
      { h2: "Se faire accompagner" },
      {
        p: `E&B Immo accompagne acquéreurs et investisseurs à Deauville et sur toute la Côte Fleurie. Visites ciblées, négociation, mise en location : un interlocuteur unique pour sécuriser votre projet.`,
      },
    ],
  },
  {
    slug: "vendre-vite-cote-fleurie",
    title: "Vendre vite et bien son bien sur la Côte Fleurie",
    description:
      "Conseils pratiques pour vendre rapidement son bien immobilier à Deauville, Trouville, Honfleur et la Côte Fleurie au meilleur prix.",
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
