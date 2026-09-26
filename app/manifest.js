export default function manifest() {
  return {
    name: "E&B Immo — Agence immobilière",
    short_name: "E&B Immo",
    description: "Agence immobilière à Bavent, Cabourg, Troarn, Merville-Franceville et Petiville.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d0e13",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
