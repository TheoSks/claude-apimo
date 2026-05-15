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

  return staticRoutes;
}
