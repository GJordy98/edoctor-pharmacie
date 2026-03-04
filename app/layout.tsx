import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ToastContainer from "@/components/ui/ToastContainer";
import FcmInitializer from "@/components/FcmInitializer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "e-Dr TIM Pharmacy – Gestion de pharmacie",
  description: "Gérez votre pharmacie, vos stocks et vos commandes.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${inter.variable} antialiased bg-[#F8FAFC] text-[#1E293B]`}
        style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
      >
        {children}
        <ToastContainer />
        {/* Initialise Firebase FCM et enregistre le token push */}
        <FcmInitializer />
      </body>
    </html>
  );
}
