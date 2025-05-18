"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Search,
  User,
  Upload,
  ImageIcon,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: User },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/search", label: "Find", icon: Search },
];

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll event to change header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-primary text-primary-foreground size-10 rounded-lg flex items-center justify-center">
              <Search className="size-5" />
            </div>
          </motion.div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="font-bold text-xl tracking-tight">FaceFind</span>
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "relative px-4",
                    isActive
                      ? "text-primary-foreground"
                      : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4" />
                    {item.label}
                  </span>

                  {/* {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      layoutId="navbar-indicator"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )} */}
                </Button>
              </Link>
            );
          })}

          {/* <div className="ml-4">
            <ModeToggle />
          </div> */}
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          {/* <ModeToggle /> */}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-8 mt-8">
                <Link href="/" className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground size-10 rounded-lg flex items-center justify-center">
                    <Search className="size-5" />
                  </div>
                  <span className="font-bold text-xl tracking-tight">
                    FaceFind
                  </span>
                </Link>

                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link key={item.href} href={item.href} passHref>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className="w-full justify-start"
                        >
                          <Icon className="mr-2 size-4" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
