"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Car,
  FileText,
  Settings,
  LogOut,
  Menu,
  Plus,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/cars", label: "Cars", icon: Car },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/60 backdrop-blur-2xl border-b border-white/40 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/dashboard" className="transition-transform duration-200 hover:scale-105">
          <img
            src="/images/amberdrive-logo-black.svg"
            alt="AMBER"
            className="h-5 w-auto"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-white/40 backdrop-blur-sm rounded-2xl p-1.5 border border-white/30">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/80 shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/quotes/new">
            <Button
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl"
            >
              <Plus className="h-4 w-4" />
              New Quote
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-red-600 hover:bg-red-50/50"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-white/80 backdrop-blur-2xl border-l border-white/40">
            <div className="flex flex-col gap-2 mt-8">
              <div className="px-3 mb-6">
                <img
                  src="/images/amberdrive-logo-black.svg"
                  alt="AMBER"
                  className="h-5 w-auto"
                />
              </div>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    <button
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-white/80 shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </button>
                  </Link>
                );
              })}
              <Link href="/quotes/new" onClick={() => setMobileOpen(false)}>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200">
                  <Plus className="h-5 w-5" />
                  New Quote
                </button>
              </Link>
              <div className="border-t border-border/30 mt-4 pt-4">
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50/50 transition-all duration-200"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
