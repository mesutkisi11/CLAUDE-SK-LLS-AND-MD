import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "RandevuPro — Online Randevu Sistemi",
  description: "İşletmeniz için kolay, hızlı online randevu yönetimi. Berber, klinik, güzellik salonu ve daha fazlası.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
