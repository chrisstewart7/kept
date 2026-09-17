import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Providers } from "@/components/providers";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PayPig — Route token fees into subs and donations",
    template: "%s · PayPig",
  },
  description:
    "Point a token's creator fees at any OnlyFans creator. PayPig turns those fees into real subscriptions and donations, delivered straight to the creator. 80% to the creator, 20% burns $PAYPIG.",
  openGraph: {
    siteName: "PayPig",
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    site: "@PayPigApp",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f8ff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
