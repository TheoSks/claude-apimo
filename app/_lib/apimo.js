const PROVIDER = process.env.APIMO_PROVIDER || "4019";
const TOKEN = process.env.APIMO_TOKEN || "5ccdef5377bd6f2f41681f17233c7818a3484333";
const AGENCY = process.env.APIMO_AGENCY || "23650";

export const APIMO_CATEGORIES = {
  1: "Vente",
  2: "Location",
  3: "Viager",
  4: "Saisonnier",
};

export const APIMO_TYPES = {
  1: "Appartement", 2: "Maison", 3: "Terrain", 4: "Parking", 5: "Bureau",
  6: "Commerce", 7: "Immeuble", 8: "Loft", 9: "Château", 10: "Local",
  11: "Villa", 12: "Ferme", 13: "Propriété", 14: "Manoir", 15: "Hôtel particulier",
  16: "Programme neuf", 17: "Fonds de commerce", 18: "Entrepôt", 19: "Chambre",
  20: "Studio", 21: "Duplex", 22: "Triplex",
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
  return APIMO_TYPES[p.type] || APIMO_TYPES[p.subtype] || "Bien";
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
