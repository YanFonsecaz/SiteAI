import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // Switch to Poppins
import "./globals.css";
import { cn } from "@/lib/utils";

// Configure Poppins with multiple weights
const poppins = Poppins({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "SEO SaaS IA - Otimização Inteligente",
  description: "Aumente seu tráfego orgânico com nossa plataforma de SEO baseada em Inteligência Artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={cn(poppins.variable, "font-sans antialiased bg-background text-foreground selection:bg-primary selection:text-white")}>
        {children}
      </body>
    </html>
  );
}
