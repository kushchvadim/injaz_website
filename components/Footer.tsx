import { Sparkles } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/40 bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center space-x-2">
          <Image
            src="/logo.svg"
            alt="SponsorSeek Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
            <span className="text-lg font-bold">SponsorSeek</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 SponsorSeek. Demo at GITEX.
          </p>
        </div>
      </div>
    </footer>
  );
}
