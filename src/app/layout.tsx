import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
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
      <body
        className={[
          inter.variable,
          fontSans.variable,
          "min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(251,191,36,0.14),_transparent_30%),#04070d]",
          "font-sans text-white selection:bg-cyan-500/30 selection:text-white",
        ].join(" ")}
      >
        <SWRProvider>{children}</SWRProvider>
      </body>
    </html>
  );
}
