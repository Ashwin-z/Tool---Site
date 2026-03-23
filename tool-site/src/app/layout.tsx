import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import SiteNav from "@/components/site-nav";
import PopularTools from "@/components/popular-tools";
import { NavShellProvider } from "@/components/nav-shell-context";
import { ThemeProvider } from "@/components/theme-context";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "ToolCraft — Free Online Tools",
  description:
    "ToolCraft offers free online tools like Word Counter, calculators, JSON formatter, encoders, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmSans.variable} antialiased`}>
        <ThemeProvider>
        <NavShellProvider>
          <div className="min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
            <SiteHeader />
            <SiteNav />
            {children}
            <PopularTools />
            <SiteFooter />
          </div>
        </NavShellProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
