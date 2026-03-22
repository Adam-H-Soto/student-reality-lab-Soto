import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto-mono/400.css";
import "@fontsource/roboto-mono/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "YourNextMove",
  description:
    "Ask our AI assistant any questions about grocery affordability, food insecurity patterns, lifestyle, income, housing, and more across the US.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const showAnalytics = process.env.NODE_ENV === "production";

  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {showAnalytics ? <Analytics /> : null}
      </body>
    </html>
  );
}
