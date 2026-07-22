export const BUCKETS = [
  {
    slug: "vente-maison",
    transaction: "Vente",
    typeLabel: "Maison",
    h1: (city) => `Maison à vendre à ${city}`,
    title: (city) => `Maison à vendre ${city} — Annonces vente maisons`,
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
    title: (city) => `Appartement à vendre ${city} — Annonces immobilières`,
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
    title: (city) => `Villa à vendre ${city} — Biens d'exception`,
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
    title: (city) => `Maison à louer ${city} — Locations longue durée`,
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
    title: (city) => `Appartement à louer ${city} — Locations`,
    description: (city) =>
      `Appartements à louer à ${city} : studios, 2 pièces, 3 pièces. Locations longue durée sur la Côte Fleurie avec E&B Immo.`,
    intro: (city) =>
      `Découvrez les appartements à louer à ${city} proposés par E&B Immo. Locations longue durée meublées et non meublées sur la Côte Fleurie.`,
    match: (p) => p.category === 2 && [1, 8, 19, 20, 21, 22].includes(p.type),
  },
  {
    slug: "vente-terrain",
    transaction: "Vente",
    typeLabel: "Terrain",
    h1: (city) => `Terrain à vendre à ${city}`,
    title: (city) => `Terrain à vendre ${city} — Terrains constructibles`,
    description: (city) =>
      `Terrains à vendre à ${city} sur la Côte Fleurie : terrains constructibles et parcelles à bâtir. Sélection E&B Immo, agence immobilière en Normandie.`,
    intro: (city) =>
      `Vous recherchez un terrain à vendre à ${city} ? E&B Immo vous accompagne dans l'achat de terrains constructibles et de parcelles à bâtir à ${city} et sur la Côte Fleurie.`,
    match: (p) => p.category === 1 && p.type === 3,
  },
  {
    slug: "vente-immeuble",
    transaction: "Vente",
    typeLabel: "Immeuble",
    h1: (city) => `Immeuble à vendre à ${city}`,
    title: (city) => `Immeuble à vendre ${city} — Investissement locatif`,
    description: (city) =>
      `Immeubles de rapport à vendre à ${city}. Opportunités d'investissement locatif sur la Côte Fleurie sélectionnées par E&B Immo.`,
    intro: (city) =>
      `Découvrez les immeubles à vendre à ${city} proposés par E&B Immo : immeubles de rapport et opportunités d'investissement locatif sur la Côte Fleurie.`,
    match: (p) => p.category === 1 && p.type === 7,
  },
  {
    slug: "vente-local-commercial",
    transaction: "Vente",
    typeLabel: "Local commercial",
    h1: (city) => `Local commercial à vendre à ${city}`,
    title: (city) => `Local commercial à vendre ${city} — Murs & commerces`,
    description: (city) =>
      `Locaux commerciaux, bureaux et fonds de commerce à vendre à ${city}. Immobilier d'entreprise sur la Côte Fleurie avec E&B Immo.`,
    intro: (city) =>
      `E&B Immo vous propose des locaux commerciaux, bureaux et fonds de commerce à vendre à ${city}. Trouvez le local professionnel idéal sur la Côte Fleurie.`,
    match: (p) => p.category === 1 && [5, 6, 10, 17, 18].includes(p.type),
  },
  {
    slug: "viager",
    transaction: "Viager",
    typeLabel: "Bien en viager",
    h1: (city) => `Viager à ${city}`,
    title: (city) => `Viager ${city} — Vente en viager occupé & libre`,
    description: (city) =>
      `Biens en viager à ${city} sur la Côte Fleurie : viager occupé et viager libre. Accompagnement E&B Immo pour vendeurs et acquéreurs.`,
    intro: (city) =>
      `Vous vous intéressez au viager à ${city} ? E&B Immo vous accompagne dans la vente et l'achat en viager occupé ou libre à ${city} et sur la Côte Fleurie.`,
    match: (p) => p.category === 3,
  },
  {
    slug: "location-saisonniere",
    transaction: "Location saisonnière",
    typeLabel: "Location saisonnière",
    h1: (city) => `Location saisonnière à ${city}`,
    title: (city) => `Location saisonnière ${city} — Vacances bord de mer`,
    description: (city) =>
      `Locations saisonnières à ${city} sur la Côte Fleurie : appartements et maisons de vacances au bord de mer. Réservez votre séjour avec E&B Immo.`,
    intro: (city) =>
      `Profitez de la Côte Fleurie avec nos locations saisonnières à ${city}. E&B Immo sélectionne appartements et maisons de vacances pour vos séjours en bord de mer.`,
    match: (p) => p.category === 4,
  },
];

export function findBucket(slug) {
  return BUCKETS.find((b) => b.slug === slug);
}
