import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MerbabuStay — Homestay di Kaki Gunung Merbabu",
    template: "%s | MerbabuStay",
  },
  description:
    "Nikmati penginapan nyaman dengan pemandangan Gunung Merbabu yang spektakuler. Booking online mudah, aman, dan transparan.",
  keywords: [
    "homestay merbabu",
    "penginapan gunung merbabu",
    "villa merbabu",
    "booking homestay selo",
    "merbabustay",
  ],
  openGraph: {
    title: "MerbabuStay — Homestay di Kaki Gunung Merbabu",
    description:
      "Penginapan nyaman dengan pemandangan Gunung Merbabu yang memukau.",
    url: "https://merbabustay.id",
    siteName: "MerbabuStay",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
