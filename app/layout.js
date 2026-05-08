import "./globals.css";

export const metadata = {
  title: "E&B Immo — Agence immobilière digitale de la côte fleurie",
  description:
    "Votre agence immobilière digitale. Achat, vente et location de biens immobiliers en Normandie.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}
