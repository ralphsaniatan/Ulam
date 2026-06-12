"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Utensils, Calendar, Apple, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Today",
      href: "/",
      icon: Utensils,
    },
    {
      label: "Planner",
      href: "/planner",
      icon: Calendar,
    },
    {
      label: "Pantry",
      href: "/pantry",
      icon: Apple,
    },
    {
      label: "Add Recipe",
      href: "/add-recipe",
      icon: PlusCircle,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 dark:bg-slate-950/85 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 z-40 px-4 py-2 flex justify-around items-center shadow-lg pb-safe-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-300 relative group cursor-pointer"
          >
            {/* Active Highlight Glow */}
            {isActive && (
              <span className="absolute inset-0 bg-orange-500/10 dark:bg-orange-500/15 rounded-xl animate-pulse -z-10" />
            )}

            <Icon
              className={cn(
                "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
                isActive
                  ? "text-orange-500 stroke-[2.5]"
                  : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400"
              )}
            />

            <span
              className={cn(
                "text-[10px] font-semibold mt-1 transition-colors duration-200",
                isActive
                  ? "text-orange-500 font-bold"
                  : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400"
              )}
            >
              {item.label}
            </span>

            {/* Bottom active line indicator */}
            {isActive && (
              <span className="absolute bottom-0 w-4 h-0.5 bg-orange-500 rounded-full animate-in fade-in zoom-in duration-300" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
