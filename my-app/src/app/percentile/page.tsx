'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PercentileConverter } from '@/components/PercentileConverter';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PercentilePage() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-[900px] mx-auto px-6 pt-[100px] pb-[60px] max-md:pt-[90px] max-md:pb-[40px]">
        {/* Page Title */}
        <div className="text-center mb-10">
          <h1 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-white tracking-[-0.03em] mb-3">
            Percentile to Rank <span className="text-[#fed802]">Converter</span>
          </h1>
          <p className="text-[#777] text-[15px] max-w-[500px] mx-auto">
            Instantly convert your JEE Main percentile to an approximate All India Rank.
          </p>
        </div>

        {/* Converter Component */}
        <PercentileConverter />
      </div>

      <Footer />

      {/* Back to top */}
      {showBackToTop && (
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 h-11 w-11 rounded-xl shadow-[0_4px_20px_rgba(254,216,2,0.3)] z-50 p-0 hover:scale-105 transition-transform"
          variant="default"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

    </main>
  );
}
