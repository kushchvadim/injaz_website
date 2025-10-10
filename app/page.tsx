import { NavBar } from '@/components/NavBar';
import { Hero } from '@/components/Hero';
import { SocialProof } from '@/components/SocialProof';
import { HowItWorks } from '@/components/HowItWorks';
import { BottomTagline } from '@/components/BottomTagline';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <NavBar />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <BottomTagline />
      <Footer />
    </main>
  );
}
