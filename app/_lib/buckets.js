export const BUCKETS = [
  {
    slug: "vente-maison",
    transaction: "Vente",
    typeLabel: "Maison",
    h1: (city) => `Maison à vendre à ${city}`,
    title: (city) => `Maison à vendre ${city} — Annonces vente maisons | E&B Immo`,
    description: (city) =>
      `Découvrez nos maisons à vendre à ${city} sur la Côte Fleurie. Sélection E&B Immo : maisons de caractère, villas et propriétés en Normandie.`,
    intro: (city) =>
      `Vous cherchez une maison à vendre à ${city} ? E&B Immo vous propose une sélection de maisons et villas en vente à ${city} et sur la Côte Fleurie, du pied-à-terre à la propriété d'exception.`,
    match: (p) => p.category === 1 && [2, 11, 13, 14, 15].includes(p.type),
  },
  {
    slug: "vente-appartement",
    transaction: "Vente",
    typeLabel: "Appartement",
    h1: (city) => `Appartement à vendre à ${city}`,
    title: (city) => `Appartement à vendre ${city} — Annonces immobilières | E&B Immo`,
    description: (city) =>
      `Appartements à vendre à ${city} : studios, 2 pièces, 3 pièces et plus. Sélection E&B Immo, agence immobilière de la Côte Fleurie.`,
    intro: (city) =>
      `Découvrez les appartements à vendre à ${city} proposés par E&B Immo. Du studio vue mer au grand appartement familial, notre sélection couvre tous les budgets sur la Côte Fleurie.`,
    match: (p) => p.category === 1 && [1, 8, 19, 20, 21, 22].includes(p.type),
  },
  {
    slug: "vente-villa",
    transaction: "Vente",
    typeLabel: "Villa",
    h1: (city) => `Villa à vendre à ${city}`,
    title: (city) => `Villa à vendre ${city} — Biens d'exception | E&B Immo`,
    description: (city) =>
      `Villas et propriétés d'exception à vendre à ${city}. Découvrez les biens prestige sélectionnés par E&B Immo sur la Côte Fleurie.`,
    intro: (city) =>
      `Explorez nos villas à vendre à ${city}. E&B Immo sélectionne pour vous les plus belles villas Belle Époque, anglo-normandes et contemporaines de la Côte Fleurie.`,
    match: (p) => p.category === 1 && [11, 13, 14, 15, 9].includes(p.type),
  },
  {
    slug: "location-maison",
    transaction: "Location",
    typeLabel: "Maison",
    h1: (city) => `Maison à louer à ${city}`,
    title: (city) => `Maison à louer ${city} — Locations longue durée | E&B Immo`,
    description: (city) =>
      `Maisons à louer à ${city} en longue durée. Sélection E&B Immo de maisons et villas en location sur la Côte Fleurie.`,
    intro: (city) =>
      `Trouvez votre maison à louer à ${city} avec E&B Immo. Nous accompagnons locataires et propriétaires sur la Côte Fleurie avec un suivi personnalisé.`,
    match: (p) => p.category === 2 && [2, 11, 13, 14, 15].includes(p.type),
  },
  {
    slug: "location-appartement",
    transaction: "Location",
    typeLabel: "Appartement",
    h1: (city) => `Appartement à louer à ${city}`,
    title: (city) => `Appartement à louer ${city} — Locations | E&B Immo`,
    description: (city) =>
      `Appartements à louer à ${city} : studios, 2 pièces, 3 pièces. Locations longue durée sur la Côte Fleurie avec E&B Immo.`,
    intro: (city) =>
      `Découvrez les appartements à louer à ${city} proposés par E&B Immo. Locations longue durée meublées et non meublées sur la Côte Fleurie.`,
    match: (p) => p.category === 2 && [1, 8, 19, 20, 21, 22].includes(p.type),
  },
];

export function findBucket(slug) {
  return BUCKETS.find((b) => b.slug === slug);
}
