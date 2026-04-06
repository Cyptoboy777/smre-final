import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const fontSans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "soso-smre | Institutional Terminal",
  description: "Advanced Crypto Intelligence and Trading Command Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} ${fontSans.variable} font-sans selection:bg-cyan-500/30 selection:text-white`}>
        {/* Cyber Overlay Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          {/* Neon Gradients */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[150px] rounded-full opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[150px] rounded-full opacity-60" />
          
          {/* Subtle Scan Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(255,255,255,0.01)_50%,transparent_100%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
        </div>

        {/* Global Page Container */}
        <main className="min-h-screen relative flex flex-col p-2 md:p-4 lg:p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
