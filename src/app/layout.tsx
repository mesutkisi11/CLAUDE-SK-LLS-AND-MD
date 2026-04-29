import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Webinar",
  description: "Next.js + Tailwind + TypeScript",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
