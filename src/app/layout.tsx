import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ULAM | Ingredients-First Daily Planner",
  description: "Dynamic meal planning based on pantry inventory states.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 overflow-x-hidden`}>
        <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-950 shadow-xl relative pb-20 flex flex-col">
          <div className="flex-1 w-full flex flex-col">
            {children}
          </div>
          <Navbar />
        </div>
      </body>
    </html>
  );
}
