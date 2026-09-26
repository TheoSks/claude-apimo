const PROVIDER = process.env.APIMO_PROVIDER || "4019";
const TOKEN = process.env.APIMO_TOKEN || "5ccdef5377bd6f2f41681f17233c7818a3484333";
const AGENCY = process.env.APIMO_AGENCY || "23650";

/* Catalogue officiel Apimo "property_category" */
export const APIMO_CATEGORIES = {
  1: "Vente",
  2: "Location",
  3: "Location saisonnière",
  4: "Programme",
  5: "Viager",
  6: "Enchère",
};

/* Catalogue officiel Apimo "property_type" */
export const APIMO_TYPES = {
  1: "Appartement", 2: "Maison", 3: "Terrain", 4: "Commerce", 5: "Garage / Parking",
  6: "Immeuble", 7: "Bureau", 8: "Bateau", 9: "Local d'activité / Entrepôt", 10: "Cave / Box",
};

/* Catalogue officiel Apimo "property_subtype" (sous-types) */
export const APIMO_SUBTYPES = {
  1: "Triplex", 2: "Terrain constructible", 3: "Terrain inconstructible", 4: "Penthouse",
  5: "Appartement", 6: "Studio", 7: "Château", 8: "Commerce", 9: "Duplex", 10: "Manoir",
  11: "Ferme", 12: "Loft", 13: "Maison de village", 14: "Villa", 15: "Appartement villa",
  16: "Grange", 17: "Ruine", 18: "Maison", 19: "Propriété", 20: "Ensemble immobilier",
  21: "Moulin", 22: "Garage", 23: "Fermette", 24: "Immeuble", 25: "Maison de ville",
  27: "Chaumière", 29: "Hangar", 31: "Local", 32: "Chalet", 33: "Local commercial",
  34: "Fonds de commerce", 35: "Droit au bail", 36: "Bureau", 37: "Hôtel particulier",
  39: "Exploitation agricole", 40: "Cave", 41: "Entrepôt", 43: "Parking", 44: "Hôtel",
  45: "Haras", 46: "Terrain", 52: "Péniche", 55: "Domaine équestre", 56: "Maison d'hôtes",
  57: "Gîte", 59: "Box", 63: "Atelier", 70: "Maison de plain-pied", 71: "Maison jumelée",
  73: "Maison de plage", 78: "Terrain résidentiel", 79: "Terrain commercial", 80: "Lotissement",
  83: "Maison individuelle", 88: "Pavillon", 103: "Terrain agricole",
  104: "Local et fonds de commerce", 111: "Dépendance",
};

export function slugify(str) {
  return String(str || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function typeLabel(p) {
  return APIMO_TYPES[p.type] || APIMO_SUBTYPES[p.subtype] || "Bien";
}

export function categoryLabel(p) {
  return APIMO_CATEGORIES[p.category] || "";
}

export function cityName(p) {
  return typeof p.city === "object" ? p.city?.name || "" : p.city || "";
}

export function priceFmt(value) {
  if (!value) return "Prix sur demande";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

async function apimoFetch(path, revalidate = 600) {
  const auth = Buffer.from(`${PROVIDER}:${TOKEN}`).toString("base64");
  const res = await fetch(`https://api.apimo.pro/agencies/${AGENCY}${path}`, {
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    next: { revalidate },
  });
  if (!res.ok) return null;
  return res.json();
}

let _cache = { data: null, at: 0 };

export async function getAllProperties() {
  if (_cache.data && Date.now() - _cache.at < 5 * 60 * 1000) return _cache.data;
  const data = await apimoFetch("/properties?limit=500");
  const list = data?.properties || [];
  _cache = { data: list, at: Date.now() };
  return list;
}

export async function getPropertyByRef(ref) {
  const list = await getAllProperties();
  return list.find((p) => String(p.reference) === String(ref) || String(p.id) === String(ref)) || null;
}

export async function getPropertiesByCitySlug(slug) {
  const list = await getAllProperties();
  return list.filter((p) => slugify(cityName(p)) === slug);
}

export function propertyPath(p) {
  return `/biens/${p.reference || p.id}-${slugify(typeLabel(p))}-${slugify(cityName(p))}`;
}

export function propertyTitle(p) {
  const type = typeLabel(p);
  const area = p.area?.value || p.area?.total || 0;
  const rooms = p.rooms ? `${p.rooms} pièces` : "";
  const city = cityName(p);
  return [type, area ? `${area} m²` : "", rooms, city].filter(Boolean).join(" — ");
}

export function propertyImage(p) {
  return p.pictures?.[0]?.url || p.thumbnail || null;
}
