import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

import ThemeProvider from "@/components/ThemeProvider";
import BootstrapClientInit from "@/components/BootstrapClientInit"; 
import LayoutWrapper from "@/components/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GeoInsights | Transform Location Data into Actionable Insights.",
  description: "Geospatial Data Visualization Platform",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <BootstrapClientInit /> 
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
