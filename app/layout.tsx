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
    "PayPig is rebuilding how creator fees work. Deploy a token and send its fees to your favorite OnlyFans creator — first as a subscription, then as donations shilling your coin. $PAYPIG is the flywheel: ecosystem volume flows back to holders.",
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
  themeColor: "#FAFCFE",
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
