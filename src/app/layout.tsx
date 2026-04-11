import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME, APP_TITLE } from "@/config/app";
import { SWRProvider } from "@/lib/providers/SWRProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fontSans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: APP_TITLE,
  applicationName: APP_NAME,
  description: APP_DESCRIPTION,
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body
        className={[
          inter.variable,
          fontSans.variable,
          fontMono.variable,
          "min-h-screen bg-[#0b0e11] font-sans text-white selection:bg-[#ccff00]/30 selection:text-white antialiased",
        ].join(" ")}
      >
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  );
}

