'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, ArrowRight, TrendingUp, RotateCcw, Info, ArrowUp, Sparkles } from 'lucide-react';

const TOTAL_CANDIDATES = 1304653;

interface RankBreakdown {
  rank: number;
  percentile: number;
  rangeHigh: string;
  rangeLow: string;
  difficulty: string;
  difficultyColor: string;
}

function calculateBreakdown(percentile: number): RankBreakdown {
  const rank = Math.max(1, Math.round(((100 - percentile) / 100) * TOTAL_CANDIDATES));
  // Approximate +/- 5% variance for range
  const rangeHigh = Math.max(1, Math.round(rank * 0.90));
  const rangeLow = Math.round(rank * 1.10);

  let difficulty = '';
  let difficultyColor = '';

  if (percentile >= 99.5) {
    difficulty = 'Top IITs / NIT Tier-1';
    difficultyColor = '#10b981';
  } else if (percentile >= 98) {
    difficulty = 'NITs / IIIT Tier-1';
    difficultyColor = '#3b82f6';
  } else if (percentile >= 95) {
    difficulty = 'Good NITs / Top GFTIs';
    difficultyColor = '#8b5cf6';
  } else if (percentile >= 90) {
    difficulty = 'Lower NITs / GFTIs';
    difficultyColor = '#f59e0b';
  } else if (percentile >= 75) {
    difficulty = 'GFTIs / State Colleges';
    difficultyColor = '#f97316';
  } else {
    difficulty = 'Private / State Colleges';
    difficultyColor = '#ef4444';
  }

  return { rank, percentile, rangeHigh: rangeHigh.toLocaleString(), rangeLow: rangeLow.toLocaleString(), difficulty, difficultyColor };
}

const quickConversions = [99.5, 99, 98, 97, 95, 90, 85, 80, 75, 50];

export function PercentileConverter() {
  const [percentile, setPercentile] = useState<string>('');
  const [result, setResult] = useState<RankBreakdown | null>(null);
  const [error, setError] = useState<string>('');
  const resultRef = useRef<HTMLDivElement>(null);

  const handleCalculate = (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = parseFloat(percentile);

    if (isNaN(value) || value < 0 || value > 100) {
      setError('Please enter a valid percentile between 0 and 100');
      setResult(null);
      return;
    }

    setError('');
    setResult(calculateBreakdown(value));
  };

  const handleQuick = (p: number) => {
    setPercentile(String(p));
    setError('');
    setResult(calculateBreakdown(p));
  };

  const handleReset = () => {
    setPercentile('');
    setResult(null);
    setError('');
  };

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [result]);

  // ─── Shared inline styles matching PredictorPage ───
  const cardSt: React.CSSProperties = {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '20px',
    padding: '32px',
    marginBottom: '16px',
  };

  const headingSt: React.CSSProperties = {
    fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '24px', paddingBottom: '16px',
    borderBottom: '1px solid rgba(254,216,2,0.1)', letterSpacing: '-0.02em',
  };

  return (
    <div className="percentile-wrapper" style={{ width: '100%' }}>
      {/* ─── Calculator Card ─── */}
      <div className="predictor-card" style={cardSt}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(254,216,2,0.1)' }}>
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calculator size={22} color="#ef4444" />
          </div>
          <h2 className="font-display" style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
            Percentile to Rank
          </h2>
        </div>

        <form onSubmit={handleCalculate}>
          <div className="percentile-grid" style={{ display: 'grid', gap: '20px', marginBottom: '24px' }}>
            <div className="space-y-2">
              <Label>Your JEE Main Percentile <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                value={percentile}
                onChange={(e) => setPercentile(e.target.value)}
                placeholder="Enter percentile (e.g. 95.5)"
                step="0.0000001"
                min="0"
                max="100"
              />
              <small className="text-muted-foreground text-[12px] mt-1 block">
                Based on ~13,04,653 students appearing in JEE Main 2026
              </small>
            </div>
          </div>

          {/* Quick conversions */}
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px', fontWeight: 500 }}>Quick convert:</p>
            <div className="quick-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {quickConversions.map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => handleQuick(p)}
                  style={{
                    background: percentile === String(p) ? 'rgba(254,216,2,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${percentile === String(p) ? 'rgba(254,216,2,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    color: percentile === String(p) ? '#fed802' : '#888',
                    padding: '6px 16px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="predictor-buttons flex flex-col sm:flex-row justify-center gap-3 mt-6 mb-2">
            <Button type="submit" size="lg" className="w-full sm:w-auto min-w-[200px]">
              <Calculator className="mr-2 h-5 w-5" />
              Calculate Rank
            </Button>
            <Button type="button" onClick={handleReset} variant="outline" size="lg" className="w-full sm:w-auto">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </form>
      </div>

      {/* ─── Error ─── */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', color: '#f87171', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* ─── Result Card ─── */}
      {result && (
        <div ref={resultRef} className="predictor-card" style={{ ...cardSt, animation: 'fadeSlideIn 0.4s ease' }}>
          <h2 className="font-display" style={headingSt}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} color="#fed802" /> Your Result
            </div>
          </h2>

          {/* Main rank display */}
          <div className="result-hero" style={{ textAlign: 'center', padding: '32px 0', marginBottom: '24px', background: 'rgba(254,216,2,0.03)', border: '1px solid rgba(254,216,2,0.08)', borderRadius: '16px' }}>
            <p style={{ fontSize: '13px', color: '#888', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, marginBottom: '8px' }}>
              Estimated CRL Rank
            </p>
            <div style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
              {result.rank.toLocaleString()}
            </div>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '12px' }}>
              For <span style={{ color: '#fed802', fontWeight: 700 }}>{result.percentile}</span> percentile
            </p>
          </div>

          {/* Details grid */}
          <div className="result-details-grid">
            {/* Rank Range */}
            <div className="result-detail-card" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <TrendingUp size={16} color="#3b82f6" />
                <span style={{ fontSize: '13px', color: '#3b82f6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Rank Range</span>
              </div>
              <p style={{ fontSize: '22px', fontWeight: 700, color: '#e5e5e5', fontVariantNumeric: 'tabular-nums' }}>
                {result.rangeHigh} — {result.rangeLow}
              </p>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>±10% approximate variance</p>
            </div>

            {/* College Tier */}
            <div className="result-detail-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Info size={16} color={result.difficultyColor} />
                <span style={{ fontSize: '13px', color: result.difficultyColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Expected Tier</span>
              </div>
              <p style={{ fontSize: '20px', fontWeight: 700, color: result.difficultyColor }}>
                {result.difficulty}
              </p>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>Based on general category cutoffs</p>
            </div>
          </div>

          {/* CTA */}
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/josaa" style={{ textDecoration: 'none', flex: 1, minWidth: '200px' }}>
              <Button variant="default" size="lg" className="w-full rounded-xl font-bold">
                Predict Colleges <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href="/csab" style={{ textDecoration: 'none', flex: 1, minWidth: '200px' }}>
              <Button variant="outline" size="lg" className="w-full rounded-xl">
                Try CSAB Predictor <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      )}

      {/* ─── Quick Reference Table ─── */}
      <div className="predictor-card" style={cardSt}>
        <h2 className="font-display" style={headingSt}>Quick Reference Table</h2>

        {/* Desktop table */}
        <div className="ref-table-view">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Percentile', 'Approx Rank', 'Expected Tier'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[99.9, 99.5, 99, 98, 97, 95, 90, 85, 80, 75, 50].map((p) => {
                const b = calculateBreakdown(p);
                return (
                  <tr key={p}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(254,216,2,0.03)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    onClick={() => handleQuick(p)}
                  >
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#fed802', fontWeight: 700 }}>{p}%</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#e5e5e5', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{b.rank.toLocaleString()}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: b.difficultyColor, background: `${b.difficultyColor}15`, padding: '4px 12px', borderRadius: '999px', border: `1px solid ${b.difficultyColor}25` }}>
                        {b.difficulty}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="ref-cards-view">
          {[99.9, 99.5, 99, 98, 97, 95, 90, 85, 80, 75, 50].map((p) => {
            const b = calculateBreakdown(p);
            return (
              <div
                key={p}
                onClick={() => handleQuick(p)}
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '14px', padding: '16px', marginBottom: '10px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                }}
              >
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#fed802' }}>{p}%</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Rank: <span style={{ color: '#e5e5e5', fontWeight: 600 }}>{b.rank.toLocaleString()}</span></div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: b.difficultyColor, background: `${b.difficultyColor}15`, padding: '4px 10px', borderRadius: '999px', border: `1px solid ${b.difficultyColor}25`, whiteSpace: 'nowrap' }}>
                  {b.difficulty}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Info / Disclaimer ─── */}
      <div className="predictor-card" style={{ ...cardSt, background: 'rgba(254,216,2,0.02)', borderColor: 'rgba(254,216,2,0.08)' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <Info size={18} color="#fed802" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <h3 className="font-display" style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>How We Predict Rank</h3>
            <p style={{ fontSize: '13px', color: '#777', lineHeight: 1.8 }}>
              The formula used is: <strong style={{ color: '#e5e5e5' }}>Rank = ((100 − Percentile) / 100) × Total Candidates</strong>.<br />
              For 2026, we use an estimated <strong style={{ color: '#e5e5e5' }}>13,04,653 candidates</strong>. The actual rank may vary by ±5–10% depending on the session and normalization. This is an approximate conversion for general category (CRL). Category ranks may differ.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .result-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        .ref-table-view { display: block; }
        .ref-cards-view { display: none; }
        @media (max-width: 640px) {
          .result-details-grid { grid-template-columns: 1fr; }
          .ref-table-view { display: none !important; }
          .ref-cards-view { display: block !important; }
          .predictor-card { padding: 20px !important; border-radius: 16px !important; }
          .percentile-wrapper { padding: 0 !important; }
          .predictor-buttons { flex-direction: column; }
          .predictor-buttons > * { width: 100% !important; min-width: 0 !important; }
        }
      `}</style>
    </div>
  );
}
