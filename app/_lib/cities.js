export const CITIES = [
  {
    slug: "deauville",
    name: "Deauville",
    zipcode: "14800",
    intro:
      "Station balnéaire mythique de la Côte Fleurie, Deauville séduit par ses villas Belle Époque, ses Planches et son art de vivre. E&B Immo vous accompagne dans l'achat, la vente et l'estimation de biens d'exception à Deauville.",
  },
  {
    slug: "trouville-sur-mer",
    name: "Trouville-sur-Mer",
    zipcode: "14360",
    intro:
      "Authentique port de pêche devenu station balnéaire prisée, Trouville-sur-Mer offre un marché immobilier dynamique entre appartements vue mer et maisons de caractère.",
  },
  {
    slug: "honfleur",
    name: "Honfleur",
    zipcode: "14600",
    intro:
      "Port classé et joyau architectural, Honfleur conjugue patrimoine, charme normand et art de vivre. Découvrez nos biens à la vente et à la location à Honfleur.",
  },
  {
    slug: "cabourg",
    name: "Cabourg",
    zipcode: "14390",
    intro:
      "Reine de la Côte Fleurie, Cabourg séduit par sa Promenade Marcel-Proust et son ambiance Belle Époque. Vente, achat et estimation de biens à Cabourg.",
  },
  {
    slug: "houlgate",
    name: "Houlgate",
    zipcode: "14510",
    intro:
      "Station familiale aux villas anglo-normandes remarquables, Houlgate offre un cadre de vie privilégié entre mer et campagne.",
  },
  {
    slug: "villers-sur-mer",
    name: "Villers-sur-Mer",
    zipcode: "14640",
    intro:
      "Sur le méridien de Greenwich, Villers-sur-Mer allie plage, falaises des Vaches Noires et patrimoine balnéaire. Biens à vendre et à louer.",
  },
  {
    slug: "blonville-sur-mer",
    name: "Blonville-sur-Mer",
    zipcode: "14910",
    intro:
      "Entre Deauville et Villers, Blonville-sur-Mer offre une plage de sable fin et un marché immobilier prisé des résidences secondaires.",
  },
  {
    slug: "varaville",
    name: "Varaville",
    zipcode: "14390",
    intro:
      "Aux portes de Cabourg, Varaville mêle bord de mer et campagne normande pour une qualité de vie unique sur la Côte Fleurie.",
  },
];

export function findCity(slug) {
  return CITIES.find((c) => c.slug === slug);
}
