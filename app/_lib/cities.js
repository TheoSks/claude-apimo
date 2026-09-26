export const CITIES = [
  {
    slug: "bavent",
    name: "Bavent",
    zipcode: "14860",
    intro:
      "Siège de l'agence E&B Immo, Bavent offre un cadre de vie paisible entre marais de la Dives, campagne normande et plages de la Côte Fleurie à quelques minutes. Maisons familiales, terrains à bâtir et biens de caractère : découvrez nos annonces à Bavent et Robehomme.",
    priceApt: [2500, 3500],
    priceHouse: [2600, 3800],
  },
  {
    slug: "cabourg",
    name: "Cabourg",
    zipcode: "14390",
    intro:
      "Reine de la Côte Fleurie, Cabourg séduit par sa Promenade Marcel-Proust et son ambiance Belle Époque. Vente, achat et estimation de biens à Cabourg.",
    priceApt: [5000, 7000],
    priceHouse: [4500, 6500],
  },
  {
    slug: "troarn",
    name: "Troarn",
    zipcode: "14670",
    intro:
      "Commune dynamique entre Caen et la mer, Troarn allie commerces, écoles et accès rapide à l'A13. Un marché recherché par les familles : maisons avec jardin, pavillons récents et terrains constructibles.",
    priceApt: [2200, 3000],
    priceHouse: [2300, 3300],
  },
  {
    slug: "merville-franceville-plage",
    name: "Merville-Franceville-Plage",
    zipcode: "14810",
    intro:
      "Entre l'estuaire de l'Orne et Cabourg, Merville-Franceville-Plage offre de grandes plages de sable, des dunes préservées et un marché immobilier prisé en résidence principale comme secondaire.",
    priceApt: [3800, 5500],
    priceHouse: [3500, 5500],
  },
  {
    slug: "petiville",
    name: "Petiville",
    zipcode: "14390",
    intro:
      "À 7 minutes de Cabourg, Petiville conjugue calme de la campagne et proximité des plages. Maisons familiales et terrains y attirent ceux qui recherchent l'espace à deux pas de la Côte Fleurie.",
    priceApt: [2600, 3600],
    priceHouse: [2700, 3800],
  },
  {
    slug: "honfleur",
    name: "Honfleur",
    zipcode: "14600",
    intro:
      "Port classé et joyau architectural, Honfleur conjugue patrimoine, charme normand et art de vivre. Découvrez nos biens à la vente et à la location à Honfleur.",
    priceApt: [4500, 6500],
    priceHouse: [4000, 6500],
  },
  {
    slug: "houlgate",
    name: "Houlgate",
    zipcode: "14510",
    intro:
      "Station familiale aux villas anglo-normandes remarquables, Houlgate offre un cadre de vie privilégié entre mer et campagne.",
    priceApt: [4000, 6000],
    priceHouse: [3800, 5800],
  },
  {
    slug: "villers-sur-mer",
    name: "Villers-sur-Mer",
    zipcode: "14640",
    intro:
      "Sur le méridien de Greenwich, Villers-sur-Mer allie plage, falaises des Vaches Noires et patrimoine balnéaire. Biens à vendre et à louer.",
    priceApt: [4000, 5500],
    priceHouse: [3800, 5500],
  },
  {
    slug: "blonville-sur-mer",
    name: "Blonville-sur-Mer",
    zipcode: "14910",
    intro:
      "Entre Villers-sur-Mer et Bénerville, Blonville-sur-Mer offre une plage de sable fin et un marché immobilier prisé des résidences secondaires.",
    priceApt: [4000, 5800],
    priceHouse: [3800, 5500],
  },
  {
    slug: "varaville",
    name: "Varaville",
    zipcode: "14390",
    intro:
      "Aux portes de Cabourg, Varaville mêle bord de mer et campagne normande pour une qualité de vie unique sur la Côte Fleurie.",
    priceApt: [3500, 5000],
    priceHouse: [3200, 4800],
  },
];

export function findCity(slug) {
  return CITIES.find((c) => c.slug === slug);
}

/** Fourchette de prix indicative formatée, ex. "5 000 à 7 500 €/m²". */
export function priceRange(range) {
  if (!range) return null;
  const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n);
  return `${fmt(range[0])} à ${fmt(range[1])} €/m²`;
}
