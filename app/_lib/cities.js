export const CITIES = [
  {
    slug: "deauville",
    name: "Deauville",
    zipcode: "14800",
    intro:
      "Station balnéaire mythique de la Côte Fleurie, Deauville séduit par ses villas Belle Époque, ses Planches et son art de vivre. E&B Immo vous accompagne dans l'achat, la vente et l'estimation de biens d'exception à Deauville.",
    priceApt: [6000, 9000],
    priceHouse: [6500, 10000],
  },
  {
    slug: "trouville-sur-mer",
    name: "Trouville-sur-Mer",
    zipcode: "14360",
    intro:
      "Authentique port de pêche devenu station balnéaire prisée, Trouville-sur-Mer offre un marché immobilier dynamique entre appartements vue mer et maisons de caractère.",
    priceApt: [5000, 7500],
    priceHouse: [4500, 7000],
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
    slug: "cabourg",
    name: "Cabourg",
    zipcode: "14390",
    intro:
      "Reine de la Côte Fleurie, Cabourg séduit par sa Promenade Marcel-Proust et son ambiance Belle Époque. Vente, achat et estimation de biens à Cabourg.",
    priceApt: [5000, 7000],
    priceHouse: [4500, 6500],
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
      "Entre Deauville et Villers, Blonville-sur-Mer offre une plage de sable fin et un marché immobilier prisé des résidences secondaires.",
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
