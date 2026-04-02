import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Nunito, Nunito_Sans } from "next/font/google";
import "./globals.css";

const bodyFont = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const headingFont = Nunito({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "YourNextMove",
  description:
    "Explore state affordability, food security, housing, taxes, and lifestyle data in a flexible, easy-to-use workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const showAnalytics = process.env.NODE_ENV === "production";

  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable} antialiased`}>
        {children}
        {showAnalytics ? <Analytics /> : null}
      </body>
    </html>
  );
}
