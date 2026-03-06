'use client';

import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Predictors } from '@/components/Predictors';
import { Stats } from '@/components/Stats';
import { HowItWorks } from '@/components/HowItWorks';
import { Benefits } from '@/components/Benefits';
import { Testimonials } from '@/components/Testimonials';
import { Resources } from '@/components/Resources';
import { CtaBanner } from '@/components/CtaBanner';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <Predictors />
      <Stats />
      <HowItWorks />
      <Benefits />
      <Testimonials />
      <Resources />
      <CtaBanner />
      <Footer />
    </main>
  );
}
