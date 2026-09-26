/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.apimo.pro" },
      { protocol: "https", hostname: "**.apimo.com" },
      { protocol: "https", hostname: "ebimmo.com" },
    ],
  },
  // Deauville et Trouville ne font plus partie du secteur de l'agence :
  // on redirige les anciennes URL (déjà indexées par Google) vers Cabourg.
  async redirects() {
    return [
      { source: "/agence/:ville(deauville|trouville-sur-mer)", destination: "/agence/cabourg", permanent: true },
      { source: "/immobilier/:bucket/:ville(deauville|trouville-sur-mer)", destination: "/immobilier/:bucket/cabourg", permanent: true },
      { source: "/guides/acheter-residence-secondaire-deauville", destination: "/guides/acheter-residence-secondaire-cabourg", permanent: true },
    ];
  },
};

module.exports = nextConfig;
