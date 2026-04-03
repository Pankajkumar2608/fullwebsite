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



  return (
    <div className="w-full">
      {/* ─── Calculator Card ─── */}
      <div className="bg-white/2 border border-white/5 rounded-[20px] p-8 max-sm:p-5 mb-4">
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-[#fed802]/10">
          <div className="bg-red-500/10 border border-red-500/20 w-12 h-12 rounded-[14px] flex items-center justify-center">
            <Calculator size={22} className="text-red-500" />
          </div>
          <h2 className="font-display text-[18px] font-bold text-white m-0 tracking-[-0.02em]">
            Percentile to Rank
          </h2>
        </div>

        <form onSubmit={handleCalculate}>
          <div className="grid gap-5 mb-6">
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
          <div className="mb-6">
            <p className="text-[13px] text-[#666] mb-2.5 font-medium">Quick convert:</p>
            <div className="flex flex-wrap gap-2">
              {quickConversions.map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => handleQuick(p)}
                  className={`px-4 py-1.5 rounded-full cursor-pointer text-[13px] font-semibold transition-all duration-200 ${
                    percentile === String(p)
                      ? 'bg-[#fed802]/15 border border-[#fed802]/30 text-[#fed802]'
                      : 'bg-white/3 border border-white/5 text-[#888] hover:bg-white/5'
                  }`}
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
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 mb-4 text-red-400 text-[14px]">
          {error}
        </div>
      )}

      {/* ─── Result Card ─── */}
      {result && (
        <div ref={resultRef} className="bg-white/2 border border-white/5 rounded-[20px] p-8 max-sm:p-5 mb-4 animate-[fadeSlideIn_0.4s_ease]">
          <h2 className="font-display text-[18px] font-bold text-white mb-6 pb-4 border-b border-[#fed802]/10 tracking-[-0.02em]">
            <div className="flex items-center gap-2.5">
              <Sparkles size={18} color="#fed802" /> Your Result
            </div>
          </h2>

          {/* Main rank display */}
          <div className="text-center py-8 mb-6 bg-[#fed802]/5 border border-[#fed802]/10 rounded-2xl">
            <p className="text-[13px] text-[#888] uppercase tracking-[2px] font-semibold mb-2">
              Estimated CRL Rank
            </p>
            <div className="text-[clamp(2.5rem,8vw,3.5rem)] font-extrabold text-white leading-none tabular-nums tracking-[-0.03em]">
              {result.rank.toLocaleString()}
            </div>
            <p className="text-[14px] text-[#666] mt-3">
              For <span className="text-[#fed802] font-bold">{result.percentile}</span> percentile
            </p>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3.5">
            {/* Rank Range */}
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-[14px] p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={16} color="#3b82f6" />
                <span className="text-[13px] text-blue-500 font-semibold uppercase tracking-[1px]">Rank Range</span>
              </div>
              <p className="text-[22px] font-bold text-[#e5e5e5] tabular-nums">
                {result.rangeHigh} — {result.rangeLow}
              </p>
              <p className="text-[12px] text-[#666] mt-1.5">±10% approximate variance</p>
            </div>

            {/* College Tier */}
            <div className="bg-white/2 border border-white/5 rounded-[14px] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info size={16} color={result.difficultyColor} />
                <span className="text-[13px] font-semibold uppercase tracking-[1px]" style={{ color: result.difficultyColor }}>Expected Tier</span>
              </div>
              <p className="text-[20px] font-bold" style={{ color: result.difficultyColor }}>
                {result.difficulty}
              </p>
              <p className="text-[12px] text-[#666] mt-1.5">Based on general category cutoffs</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-6 flex gap-3 flex-wrap">
            <a href="/josaa" className="no-underline flex-1 min-w-[200px]">
              <Button variant="default" size="lg" className="w-full rounded-xl font-bold">
                Predict Colleges <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <a href="/csab" className="no-underline flex-1 min-w-[200px]">
              <Button variant="outline" size="lg" className="w-full rounded-xl">
                Try CSAB Predictor <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      )}

      {/* ─── Quick Reference Table ─── */}
      <div className="bg-white/2 border border-white/5 rounded-[20px] p-8 max-sm:p-5 mb-4">
        <h2 className="font-display text-[18px] font-bold text-white mb-6 pb-4 border-b border-[#fed802]/10 tracking-[-0.02em]">Quick Reference Table</h2>

        {/* Desktop table */}
        <div className="block max-sm:hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Percentile', 'Approx Rank', 'Expected Tier'].map(h => (
                  <th key={h} className="p-3 px-4 text-left text-[12px] font-bold text-[#888] uppercase tracking-[1px] border-b border-white/5 bg-white/2">
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
                    className="border-b border-white/5 transition-colors duration-200 cursor-pointer hover:bg-[#fed802]/5"
                    onClick={() => handleQuick(p)}
                  >
                    <td className="p-3.5 px-4 text-[14px] text-[#fed802] font-bold">{p}%</td>
                    <td className="p-3.5 px-4 text-[14px] text-[#e5e5e5] font-semibold tabular-nums">{b.rank.toLocaleString()}</td>
                    <td className="p-3.5 px-4">
                      <span className="text-[12px] font-semibold py-1 px-3 rounded-full" style={{ color: b.difficultyColor, background: `${b.difficultyColor}15`, border: `1px solid ${b.difficultyColor}25` }}>
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
        <div className="hidden max-sm:block">
          {[99.9, 99.5, 99, 98, 97, 95, 90, 85, 80, 75, 50].map((p) => {
            const b = calculateBreakdown(p);
            return (
              <div
                key={p}
                onClick={() => handleQuick(p)}
                className="bg-white/5 border border-white/5 rounded-[14px] p-4 mb-2.5 flex justify-between items-center cursor-pointer transition-colors duration-200 hover:border-white/10"
              >
                <div>
                  <div className="text-[16px] font-bold text-[#fed802]">{p}%</div>
                  <div className="text-[12px] text-[#666] mt-0.5">Rank: <span className="text-[#e5e5e5] font-semibold">{b.rank.toLocaleString()}</span></div>
                </div>
                <span className="text-[11px] font-semibold py-1 px-2.5 rounded-full whitespace-nowrap" style={{ color: b.difficultyColor, background: `${b.difficultyColor}15`, border: `1px solid ${b.difficultyColor}25` }}>
                  {b.difficulty}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Info / Disclaimer ─── */}
      <div className="bg-[#fed802]/5 border border-[#fed802]/10 rounded-[20px] p-8 max-sm:p-5 mb-4">
        <div className="flex gap-3.5 items-start">
          <Info size={18} color="#fed802" className="mt-0.5 shrink-0" />
          <div>
            <h3 className="font-display text-[15px] font-bold text-white mb-2">How We Predict Rank</h3>
            <p className="text-[13px] text-[#777] leading-[1.8]">
              The formula used is: <strong className="text-[#e5e5e5]">Rank = ((100 − Percentile) / 100) × Total Candidates</strong>.<br />
              For 2026, we use an estimated <strong className="text-[#e5e5e5]">13,04,653 candidates</strong>. The actual rank may vary by ±5–10% depending on the session and normalization. This is an approximate conversion for general category (CRL). Category ranks may differ.
            </p>
          </div>
        </div>
      </div>

      
    </div>
  );
}
