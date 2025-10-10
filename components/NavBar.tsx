'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2 transition-opacity hover:opacity-80">
          <Image
            src="/logo.svg"
            alt="SponsorSeek Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl font-bold tracking-tight">SponsorSeek</span>
        </Link>

        <div className="flex items-center space-x-6">
          
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            How It Works
          </Link>
          <Link
            href="/#contact"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
          >
            Contact
          </Link>
          <Link href="/opportunities">
            <Button className="glow-green-sm">Browse Opportunities</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
