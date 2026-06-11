import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ULAM | Meal & Grocery Orchestrator",
  description: "Weekly meal planning and automated grocery lists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 overflow-x-hidden`}>
        <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-950 shadow-xl relative">
          {children}
        </div>
      </body>
    </html>
  );
}
