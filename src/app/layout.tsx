import "./globals.css";
import type { Metadata } from "next";
import { LayoutWrapper } from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "La Meca CDA - Panel de Control",
  description: "Panel de Control de La Meca CDA",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "La Meca CDA"
  },
  icons: {
    apple: "/meca-logo.png",
    icon: "/meca-logo.png",
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased font-sans">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}

export const viewport = {
  themeColor: "#000",
};
