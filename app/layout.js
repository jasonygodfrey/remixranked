import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "RemixRanked - WoW Leaderboards",
  description: "Track and rank World of Warcraft players based on their cloak ilvl.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body>{children}</body>
    </html>
  );
}