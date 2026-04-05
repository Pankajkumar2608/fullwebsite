'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Search, RotateCcw, ChevronDown, ChevronUp,
  TrendingUp, X, Loader2, ArrowUp, Star
} from 'lucide-react';
import { useWishlist, WishlistItem } from '@/hooks/useWishlist';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
export interface PredictorConfig {
  title: string;
  apiBase: string;
  /** Which optional filter fields to show. */
  optionalFilters: string[];
  /** Table columns in results. */
  columns: { key: string; label: string; align?: 'left' | 'right' }[];
  /** Whether results include 'Opening Rank' */
  hasOpeningRank?: boolean;
  /** Accent color for the title highlight */
  accent?: string;
  /** Description */
  description?: string;
}

interface DropdownOptions {
  years?: string[];
  rounds?: string[];
  quotas?: string[];
  seatTypes?: string[];
  genders?: string[];
  institutes?: string[];
  programs?: string[];
  subCategories?: string[];
  [key: string]: string[] | undefined;
}

interface ResultRow {
  id?: string | number;
  institute?: string; Institute?: string;
  program_name?: string; 'Academic Program Name'?: string;
  quota?: string; Quota?: string;
  seat_type?: string; 'Seat Type'?: string;
  year?: string | number; Year?: string | number;
  round?: string | number; Round?: string | number;
  gender?: string; Gender?: string;
  opening_rank?: number | null; 'Opening Rank'?: number | null;
  closing_rank?: number | null; 'Closing Rank'?: number | null;
  sub_category?: string; 'Sub - Category'?: string;
  probability?: number | null;
  [key: string]: any;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const getVal = (row: ResultRow, key: string): any => {
  // Handle both snake_case (backend) and display case
  const map: Record<string, string[]> = {
    institute: ['institute', 'Institute'],
    program: ['program_name', 'Academic Program Name'],
    quota: ['quota', 'Quota'],
    seatType: ['seat_type', 'Seat Type'],
    year: ['year', 'Year'],
    round: ['round', 'Round'],
    gender: ['gender', 'Gender'],
    openingRank: ['opening_rank', 'Opening Rank'],
    closingRank: ['closing_rank', 'Closing Rank'],
    subCategory: ['sub_category', 'Sub - Category'],
  };
  const keys = map[key] || [key];
  for (const k of keys) { if (row[k] !== undefined && row[k] !== null) return row[k]; }
  return null;
};

const fmtRank = (v: any) => v != null && !isNaN(v) ? Number(v).toLocaleString() : 'N/A';

// ─────────────────────────────────────────────────────────────
// Main PredictorPage Component
// ─────────────────────────────────────────────────────────────
export function PredictorPage({ config }: { config: PredictorConfig }) {
  const PAGE_SIZE = 25;
  const accent = config.accent || '#fed802';

  // Filter state
  const [rank, setRank] = useState('');
  const [seatType, setSeatType] = useState('');
  const [year, setYear] = useState('');
  const [roundNo, setRoundNo] = useState('');
  const [quota, setQuota] = useState('');
  const [gender, setGender] = useState('');
  const [institute, setInstitute] = useState('');
  const [program, setProgram] = useState('');
  const [subCategory, setSubCategory] = useState('');

  // Data state
  const [options, setOptions] = useState<DropdownOptions>({});
  const [results, setResults] = useState<ResultRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOptional, setShowOptional] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();

  // Trends
  const [showTrends, setShowTrends] = useState(false);
  const [trendData, setTrendData] = useState<any[] | null>(null);
  const [trendInfo, setTrendInfo] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const trendsRef = useRef<HTMLDivElement>(null);

  const hasFilter = (f: string) => config.optionalFilters.includes(f);

  // ── Scroll listener ──
  useEffect(() => {
    const fn = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // ── Load dropdown options ──
  useEffect(() => {
    (async () => {
      setOptionsLoading(true);
      try {
        const types = ['years', 'rounds', 'quotas', 'seatTypes', 'genders', 'institutes', 'programs'];
        if (hasFilter('subCategory')) types.push('subCategories');
        const res = await fetch(`${config.apiBase}/options?types=${types.join(',')}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOptions(data);
      } catch {
        setError('Failed to load filter options. Please refresh.');
      } finally {
        setOptionsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.apiBase]);

  // ── Search ──
  const handleSearch = async (page = 1) => {
    if (!rank && !seatType) {
      setError('Please enter your rank or select a category.');
      return;
    }
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (rank) params.append('rank', rank);
    if (seatType) params.append('seatType', seatType);
    if (year) params.append('year', year);
    if (roundNo) params.append('round', roundNo);
    if (quota) params.append('quota', quota);
    if (gender) params.append('gender', gender);
    if (institute) params.append('institute', institute);
    if (program) params.append('program', program);
    if (subCategory) params.append('subCategory', subCategory);
    params.append('page', String(page));
    params.append('limit', String(PAGE_SIZE));

    try {
      const res = await fetch(`${config.apiBase}/colleges?${params.toString()}`);
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const data = await res.json();
      setResults(data.results || []);
      setTotalCount(data.totalCount || data.results?.length || 0);
      setTotalPages(data.totalPages || Math.ceil((data.totalCount || data.results?.length || 0) / PAGE_SIZE));
      setCurrentPage(data.currentPage || page);
      if (!data.results?.length) setError('No matching colleges found. Try broadening your filters.');
      else setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } catch (err: any) {
      setError(err.message || 'Search failed.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRank(''); setSeatType(''); setYear(''); setRoundNo(''); setQuota(''); setGender('');
    setInstitute(''); setProgram(''); setSubCategory('');
    setResults([]); setError(''); setCurrentPage(1); setTotalPages(0); setShowTrends(false);
  };

  // ── Trends ──
  const handleShowTrends = async (row: ResultRow) => {
    setShowTrends(true);
    setTrendData(null);
    setTrendInfo('Loading trend data...');
    const params = new URLSearchParams({
      institute: getVal(row, 'institute') || '',
      program: getVal(row, 'program') || '',
      quota: getVal(row, 'quota') || '',
      seatType: getVal(row, 'seatType') || '',
      gender: getVal(row, 'gender') || '',
      round: String(getVal(row, 'round') || ''),
    });
    try {
      const res = await fetch(`${config.apiBase}/trends?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const trendResults = data.results || data.data || data;
      if (!Array.isArray(trendResults) || trendResults.length === 0) {
        setTrendInfo('No historical trend data found.');
        return;
      }
      setTrendInfo('');
      setTrendData(trendResults);
    } catch {
      setTrendInfo('Failed to load trend data.');
    }
    setTimeout(() => trendsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // ── Chart ──
  useEffect(() => {
    if (!trendData || !canvasRef.current) return;
    const loadChart = async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      if (chartRef.current) chartRef.current.destroy();
      const sorted = [...trendData].sort((a, b) => {
        const ya = a.Year || a.year || 0, yb = b.Year || b.year || 0;
        if (ya !== yb) return ya - yb;
        return (parseInt(String(a.Round || a.round)) || 0) - (parseInt(String(b.Round || b.round)) || 0);
      });
      const labels = sorted.map(d => `${d.Year || d.year}-R${String(d.Round || d.round).replace(/[^0-9]/g, '')}`);
      const closing = sorted.map(d => d['Closing Rank'] ?? d.closing_rank ?? null);
      const opening = sorted.map(d => d['Opening Rank'] ?? d.opening_rank ?? null);
      const userRank = rank ? parseInt(rank) : null;
      const datasets: any[] = [
        { label: 'Closing Rank', data: closing, borderColor: '#f59e0b', borderWidth: 2.5, tension: 0.3, pointRadius: 4, fill: false, spanGaps: true },
      ];
      if (opening.some(v => v != null)) {
        datasets.push({ label: 'Opening Rank', data: opening, borderColor: '#3b82f6', borderWidth: 1.5, borderDash: [5, 5], tension: 0.3, pointRadius: 3, fill: false, spanGaps: true });
      }
      if (userRank) {
        datasets.push({ label: 'Your Rank', data: Array(labels.length).fill(userRank), borderColor: '#ef4444', borderWidth: 2, borderDash: [8, 4], pointRadius: 0, fill: false });
      }
      chartRef.current = new Chart(canvasRef.current!, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' as const, labels: { color: '#ccc', usePointStyle: true } } },
          scales: {
            y: { reverse: true, ticks: { color: '#888', callback: (v: any) => v.toLocaleString() }, grid: { color: 'rgba(255,255,255,0.06)' } },
            x: { ticks: { color: '#888', maxRotation: 45 }, grid: { display: false } },
          },
        },
      });
    };
    loadChart();
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [trendData, rank]);

  // ── Select renderer ──
  const renderSelect = (label: string, value: string, onChange: (v: string) => void, opts: string[] = [], placeholder = 'Select', required = false, disabled = false) => (
    <div>
      <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">{label} {required && <span className="text-red-500">*</span>}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full relative p-3 rounded-[10px] border border-white/10 bg-white/5 text-[#e5e5e5] text-[14px] outline-none box-border max-w-full appearance-none pr-8 cursor-pointer bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtMSAxIDYgNiA2LTYiLz48L3N2Zz4=')] bg-size-[12px_12px] bg-position-[calc(100%-16px)_center] bg-no-repeat focus:border-[#fed802]/30 disabled:opacity-50 disabled:cursor-not-allowed" disabled={disabled}>
        <option value="" className="bg-[#111]">{placeholder}</option>
        {opts.map(o => <option key={o} value={o} className="bg-[#111]">{o}</option>)}
      </select>
    </div>
  );

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 pt-[100px] pb-[60px] max-md:pt-[90px] max-md:pb-[40px]">

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-white tracking-[-0.03em] mb-3">
            {config.title.split(' ').map((w, i, arr) => i === arr.length - 1 ? <span key={i} style={{ color: accent }}>{w}</span> : w + ' ')}
          </h1>
          {config.description && <p className="text-[#777] text-[15px] max-w-[550px] mx-auto">{config.description}</p>}
        </div>

        {optionsLoading && (
          <div className="text-center py-10 text-[#888]">
            <Loader2 size={28} className="animate-spin mx-auto mb-3 block" />
            Loading filter options...
          </div>
        )}

        {!optionsLoading && (
          <>
            {/* PRIMARY FILTERS */}
            <div className="bg-white/2 border border-white/5 rounded-[20px] p-8 max-sm:p-5 mb-4">
              <h2 className="font-display text-[18px] font-bold text-white mb-6 pb-4 border-b border-[#fed802]/10 tracking-[-0.02em]">Primary Filters</h2>
              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-5">
                <div>
                  <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Your Rank <span className="text-red-500">*</span></label>
                  <input type="number" value={rank} onChange={(e) => setRank(e.target.value)} placeholder="Enter your CRL rank" min={1} className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none focus:border-[#fed802]/30 transition-colors" />
                  <small className="block mt-1 text-[11px] text-[#666]">
                    Enter CRL rank for General. For reserved categories, enter Category Rank.
                  </small>
                </div>
                {renderSelect('Category', seatType, setSeatType, options.seatTypes, 'Select Category', true)}
              </div>
            </div>

            {/* OPTIONAL TOGGLE */}
            <button onClick={() => setShowOptional(!showOptional)}
              className="flex items-center justify-center gap-2 mx-auto mb-4 bg-white/3 border border-white/5 rounded-xl px-6 py-2.5 text-[#999] hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-[14px] font-medium">
              {showOptional ? 'Hide' : 'Show'} Optional Filters
              {showOptional ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* OPTIONAL FILTERS */}
            {showOptional && (
              <div className="bg-[#080808] border border-white/5 rounded-[20px] p-8 max-sm:p-5 mb-4">
                <h2 className="font-display text-[18px] font-bold text-white mb-6 pb-4 border-b border-[#fed802]/10 tracking-[-0.02em]">Optional Filters</h2>
                <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-5">
                  {hasFilter('year') && renderSelect('Year', year, setYear, options.years, 'All Years')}
                  {hasFilter('round') && renderSelect('Round', roundNo, setRoundNo, options.rounds, 'All Rounds')}
                  {hasFilter('quota') && renderSelect('Quota', quota, setQuota, options.quotas, 'All Quotas')}
                  {hasFilter('gender') && renderSelect('Gender', gender, setGender, options.genders, 'All Genders')}
                  {hasFilter('subCategory') && renderSelect('Sub-Category', subCategory, setSubCategory, options.subCategories, 'All Sub-Categories')}
                  {hasFilter('institute') && renderSelect('Institute', institute, setInstitute, options.institutes, 'All Institutes')}
                  {hasFilter('program') && renderSelect('Program', program, setProgram, options.programs, 'All Programs')}
                </div>
              </div>
            )}

            {/* BUTTONS */}
            <div className="flex gap-4 justify-center my-8 flex-wrap max-sm:flex-col">
              <button onClick={() => handleSearch(1)} disabled={loading} className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[linear-gradient(135deg,#fed802,#fde047)] text-black font-bold text-[15px] font-display rounded-xl uppercase tracking-[1px] transition-all duration-300 shadow-[0_0_20px_rgba(254,216,2,0.2)] hover:shadow-[0_0_30px_rgba(254,216,2,0.4)] disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                {loading ? 'Searching...' : 'Predict College'}
              </button>
              <button onClick={handleReset} className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white/5 border border-white/10 text-white font-semibold text-[14px] rounded-xl transition-colors hover:bg-white/10 disabled:opacity-50">
                <RotateCcw size={18} /> Clear Filters
              </button>
            </div>
          </>
        )}

        {/* ERROR */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 mb-6 text-red-400 text-[14px]">
            {error}
          </div>
        )}

        {/* RESULTS */}
        {results.length > 0 && (
          <div ref={resultsRef} className="bg-white/2 border border-white/5 rounded-[20px] p-8 max-sm:p-5 mb-4">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5 flex-wrap gap-3">
              <h2 className="font-display text-[22px] font-bold text-white m-0">Predicted Colleges</h2>
              <span className="px-4 py-1.5 rounded-full text-[13px] font-semibold" style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
                {totalCount > 0 ? `${totalCount} results` : `${results.length} results`}
              </span>
            </div>

            {/* ── Desktop Table View ── */}
            <div className="hidden md:block overflow-x-auto rounded-xl">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr>
                    {config.columns.map(col => (
                      <th key={col.key} className="p-3.5 px-4 text-[12px] font-bold uppercase tracking-[1px] text-[#888] border-b border-white/10 bg-white/2 whitespace-nowrap" style={{ textAlign: (col.align || 'left') as any }}>{col.label}</th>
                    ))}
                    <th className="p-3.5 px-4 text-[12px] font-bold uppercase tracking-[1px] text-[#888] border-b border-white/10 bg-white/2 whitespace-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, idx) => (
                    <tr key={row.id || idx}
                      className="border-b border-white/5 transition-colors duration-200"
                      style={{ '--hover-bg': `${accent}08` } as any}
                      onMouseEnter={(e) => { e.currentTarget.style.background = e.currentTarget.style.getPropertyValue('--hover-bg'); }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                      {config.columns.map(col => {
                        if (col.key === 'details') {
                          const inst = getVal(row, 'institute') || 'N/A';
                          const details = [getVal(row, 'quota'), getVal(row, 'seatType'), getVal(row, 'subCategory'), `${getVal(row, 'year') || '-'} R${getVal(row, 'round') || '-'}`, getVal(row, 'gender')].filter(Boolean).join(' | ');
                          return (
                            <td key={col.key} className="p-3.5 px-4 text-[14px] text-[#999] align-top">
                              <div className="font-semibold text-[#e5e5e5] mb-1">{inst}</div>
                              <div className="text-[12px] text-[#666]">{details}</div>
                            </td>
                          );
                        }
                        if (col.key === 'openingRank' || col.key === 'closingRank') {
                          return <td key={col.key} className="p-3.5 px-4 text-[14px] text-[#999] align-top text-right tabular-nums">{fmtRank(getVal(row, col.key))}</td>;
                        }
                        if (col.key === 'program') {
                          return <td key={col.key} className="p-3.5 px-4 text-[14px] text-[#999] align-top">{getVal(row, 'program') || 'N/A'}</td>;
                        }
                        return <td key={col.key} className="p-3.5 px-4 text-[14px] text-[#999] align-top">{row[col.key] ?? 'N/A'}</td>;
                      })}
                      <td className="p-3.5 px-4 text-[14px] text-[#999] align-top text-center">
                        <div className="flex flex-col gap-2 items-center">
                          <button onClick={() => handleShowTrends(row)}
                            className="w-full inline-flex items-center justify-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3.5 py-1.5 rounded-lg cursor-pointer text-[12px] font-semibold hover:bg-blue-500/20 transition-colors">
                            <TrendingUp size={14} /> Trends
                          </button>
                          <button 
                            onClick={() => {
                              const inst = getVal(row, 'institute') || '';
                              const prog = getVal(row, 'program') || '';
                              const id = `${config.title}-${inst}-${prog}-${getVal(row, 'quota')}-${getVal(row, 'seatType')}-${getVal(row, 'gender')}`;
                              toggleWishlist({
                                id,
                                institute: inst,
                                program: prog,
                                quota: getVal(row, 'quota') || '',
                                seatType: getVal(row, 'seatType') || '',
                                gender: getVal(row, 'gender') || '',
                                closingRank: getVal(row, 'closingRank') || null,
                                openingRank: getVal(row, 'openingRank') || null,
                                source: config.title,
                                year: getVal(row, 'year') || '',
                                round: getVal(row, 'round') || ''
                              });
                            }}
                            className={`w-full inline-flex items-center justify-center gap-1.5 border px-3.5 py-1.5 rounded-lg cursor-pointer text-[12px] font-semibold transition-colors ${
                              isInWishlist(`${config.title}-${getVal(row, 'institute') || ''}-${getVal(row, 'program') || ''}-${getVal(row, 'quota')}-${getVal(row, 'seatType')}-${getVal(row, 'gender')}`)
                                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20'
                                : 'bg-white/5 border-white/10 text-[#888] hover:bg-white/10 hover:text-white'
                            }`}>
                            <Star size={14} className={isInWishlist(`${config.title}-${getVal(row, 'institute') || ''}-${getVal(row, 'program') || ''}-${getVal(row, 'quota')}-${getVal(row, 'seatType')}-${getVal(row, 'gender')}`) ? "fill-yellow-400" : ""} />
                            {isInWishlist(`${config.title}-${getVal(row, 'institute') || ''}-${getVal(row, 'program') || ''}-${getVal(row, 'quota')}-${getVal(row, 'seatType')}-${getVal(row, 'gender')}`) ? 'Saved' : 'Save'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Card View ── */}
            <div className="block md:hidden">
              {results.map((row, idx) => {
                const inst = getVal(row, 'institute') || 'N/A';
                const prog = getVal(row, 'program') || 'N/A';
                const details = [getVal(row, 'quota'), getVal(row, 'seatType'), getVal(row, 'subCategory'), getVal(row, 'gender')].filter(Boolean).join(' · ');
                const yearRound = `${getVal(row, 'year') || '-'} · Round ${getVal(row, 'round') || '-'}`;
                const or = getVal(row, 'openingRank');
                const cr = getVal(row, 'closingRank');
                return (
                  <div key={row.id || idx} className="bg-white/3 border border-white/5 rounded-2xl p-5 mb-3 transition-colors hover:border-white/10">
                    <div className="mb-3">
                      <div className="flex-1">
                        <div className="font-bold text-[#e5e5e5] text-[15px] leading-[1.4] mb-1">{inst}</div>
                        <div className="text-[14px] text-[#999] leading-[1.4]">{prog}</div>
                      </div>
                    </div>
                    <div className="text-[13px] text-[#666] mb-1.5 leading-normal">{details}</div>
                    <div className="text-[12px] text-[#666] mb-1.5 leading-normal">{yearRound}</div>
                    <div className="flex gap-4 my-3.5 px-4 py-3 bg-white/2 border border-white/5 rounded-xl">
                      {or != null && (
                        <div className="flex flex-col gap-0.5 flex-1">
                          <span className="text-[11px] uppercase tracking-[1px] text-[#666] font-semibold">Opening</span>
                          <span className="text-[18px] font-bold text-[#ccc] tabular-nums">{fmtRank(or)}</span>
                        </div>
                      )}
                      <div className="flex flex-col gap-0.5 flex-1">
                        <span className="text-[11px] uppercase tracking-[1px] text-[#666] font-semibold">Closing</span>
                        <span className="text-[18px] font-bold text-[#f59e0b] tabular-nums">{fmtRank(cr)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => handleShowTrends(row)} className="flex-1 py-2.5 px-4 bg-blue-500/5 border border-blue-500/15 text-blue-400 rounded-lg cursor-pointer text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-blue-500/10 hover:border-blue-500/30">
                        <TrendingUp size={14} /> Trends
                      </button>
                      <button 
                        onClick={() => {
                          const id = `${config.title}-${inst}-${prog}-${getVal(row, 'quota')}-${getVal(row, 'seatType')}-${getVal(row, 'gender')}`;
                          toggleWishlist({
                            id,
                            institute: inst,
                            program: prog,
                            quota: getVal(row, 'quota') || '',
                            seatType: getVal(row, 'seatType') || '',
                            gender: getVal(row, 'gender') || '',
                            closingRank: cr || null,
                            openingRank: or || null,
                            source: config.title,
                            year: getVal(row, 'year') || '',
                            round: getVal(row, 'round') || ''
                          });
                        }}
                        className={`flex-1 py-2.5 px-4 border rounded-lg cursor-pointer text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors ${
                          isInWishlist(`${config.title}-${inst}-${prog}-${getVal(row, 'quota')}-${getVal(row, 'seatType')}-${getVal(row, 'gender')}`)
                            ? 'bg-yellow-500/5 border-yellow-500/15 text-yellow-500 hover:bg-yellow-500/10'
                            : 'bg-white/5 border-white/10 text-[#888] hover:bg-white/10 hover:text-white'
                        }`}>
                        <Star size={14} className={isInWishlist(`${config.title}-${inst}-${prog}-${getVal(row, 'quota')}-${getVal(row, 'seatType')}-${getVal(row, 'gender')}`) ? "fill-yellow-500" : ""} /> 
                        Save
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                <button onClick={() => handleSearch(currentPage - 1)} disabled={currentPage <= 1} className="px-3.5 py-2 rounded-lg border border-white/5 bg-white/2 text-[#999] cursor-pointer text-[13px] font-semibold hover:bg-white/5 disabled:opacity-50 transition-colors">Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 5) p = i + 1;
                  else if (currentPage <= 3) p = i + 1;
                  else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                  else p = currentPage - 2 + i;
                  return (
                    <button key={p} onClick={() => handleSearch(p)}
                      className={`px-3.5 py-2 rounded-lg border cursor-pointer text-[13px] font-semibold transition-colors ${p === currentPage ? 'bg-[#fed802]/10 border-[#fed802]/30 text-[#fed802]' : 'border-white/5 bg-white/2 text-[#999] hover:bg-white/5'}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => handleSearch(currentPage + 1)} disabled={currentPage >= totalPages} className="px-3.5 py-2 rounded-lg border border-white/5 bg-white/2 text-[#999] cursor-pointer text-[13px] font-semibold hover:bg-white/5 disabled:opacity-50 transition-colors">Next</button>
              </div>
            )}
          </div>
        )}

        {/* TRENDS */}
        {showTrends && (
          <div ref={trendsRef} className="bg-white/2 border border-white/5 rounded-[20px] p-8 max-sm:p-5 mt-6 mb-4">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-display text-[20px] font-bold text-white m-0">Rank Trends</h2>
              <button onClick={() => setShowTrends(false)} className="bg-white/5 border border-white/10 text-[#888] px-4 py-2 rounded-lg cursor-pointer text-[13px] flex items-center gap-1.5 transition-colors hover:text-white hover:bg-white/10">
                <X size={14} /> Close
              </button>
            </div>
            {trendInfo && <p className="text-[#888] text-[14px] italic">{trendInfo}</p>}
            {trendData && <div className="h-[400px] relative"><canvas ref={canvasRef} /></div>}
          </div>
        )}
      </div>

      <Footer />

      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-11 h-11 rounded-xl border-none text-black cursor-pointer flex items-center justify-center z-50 transition-transform hover:-translate-y-1"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, boxShadow: `0 4px 20px ${accent}50` }}>
          <ArrowUp size={20} />
        </button>
      )}


    </main>
  );
}
