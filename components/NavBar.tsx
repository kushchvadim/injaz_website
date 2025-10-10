'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/#how-it-works', label: 'How It Works', isAnchor: true },
  { href: '/contact', label: 'Contact', isAnchor: false },
];

export function NavBar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image
            src="/logo.svg"
            alt="SponsorSeek Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="hidden text-lg font-bold tracking-tight sm:inline">SponsorSeek</span>
        </Link>

        <div className="hidden items-center space-x-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium text-foreground/80 transition-colors hover:text-primary',
                !link.isAnchor && pathname === link.href && 'text-primary'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/opportunities">
            <Button className="glow-green-sm">Browse Opportunities</Button>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md border border-border/60 p-2 text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/40 bg-background/95 shadow-lg md:hidden">
          <div className="container mx-auto flex flex-col space-y-3 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/opportunities" onClick={() => setMobileOpen(false)}>
              <Button className="glow-green w-full">Browse Opportunities</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
