import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "EPA Lab — Photoenergy & Environmental Chemistry",
    template: "%s | EPA Lab",
  },
  description:
    "Exploring the chemistry of light for clean energy and a healthier environment. Eco-friendly Photoenergy Application Laboratory at KENTECH.",
  robots: { index: false, follow: false },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
