import type { Metadata } from "next";
import { JetBrains_Mono, Rajdhani } from "next/font/google"; // Import fonts
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMRE | Smart Money Research Engine",
  description: "The Jarvis for Crypto Traders",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} ${rajdhani.variable} antialiased bg-black text-[#ededed]`}
      >
        {children}
      </body>
    </html>
  );
}
