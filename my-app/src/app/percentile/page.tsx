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
    <main style={{ minHeight: '100vh', background: '#000' }}>
      <Navbar />

      <div className="predictor-wrapper" style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 24px 60px' }}>
        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', marginBottom: '12px' }}>
            Percentile to Rank <span style={{ color: '#fed802' }}>Converter</span>
          </h1>
          <p style={{ color: '#777', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
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

      <style jsx global>{`
        @media (max-width: 768px) {
          .predictor-wrapper { padding: 90px 16px 40px !important; }
        }
      `}</style>
    </main>
  );
}
