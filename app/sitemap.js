import { CITIES } from "./_lib/cities";
import { getAllProperties, propertyPath } from "./_lib/apimo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.eb-immo.fr";

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/#annonces`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/#estimation`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/#apropos`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/#contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const cityRoutes = CITIES.map((c) => ({
    url: `${SITE_URL}/agence/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  let propertyRoutes = [];
  try {
    const list = await getAllProperties();
    propertyRoutes = list.map((p) => ({
      url: `${SITE_URL}${propertyPath(p)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    propertyRoutes = [];
  }

  return [...staticRoutes, ...cityRoutes, ...propertyRoutes];
}
