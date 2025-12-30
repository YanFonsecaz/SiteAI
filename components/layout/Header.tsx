"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = [
    { name: "Sobre", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Preços", href: "/pricing" },
    { name: "Contato", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 border-b border-primary/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-display text-2xl font-bold text-foreground tracking-wider">
          SEO<span className="text-primary">.IA</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
          <Link href="/dashboard">
            <Button variant="primary" size="sm">
              Entrar
            </Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-foreground" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-primary/10 p-4 absolute w-full left-0 animate-in slide-in-from-top-5 shadow-lg">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-base font-medium text-foreground hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link href="/dashboard">
              <Button variant="primary" className="w-full">
                Entrar
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
