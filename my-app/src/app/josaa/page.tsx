'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Search, RotateCcw, ChevronDown, ChevronUp,
  TrendingUp, X, Loader2, FileDown, ArrowUp, Star
} from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useSession } from 'next-auth/react';

const API_BASE_URL = 'https://collegepredictorapi.onrender.com';
const PAGE_SIZE = 15;
const MAX_SUGGESTIONS = 10;

const ROUND_CONFIG: Record<string, number> = {
  '2022': 6, '2023': 6, '2024': 5, '2025': 6,
};

interface CollegeResult {
  Institute: string;
  'Academic Program Name': string;
  Quota: string;
  'Seat Type': string;
  Year: string | number;
  Round: string | number;
  Gender: string;
  'Opening Rank': number | null;
  'Closing Rank': number | null;
  probability?: number | null;
  recommendation?: string;
  confidence?: string;
  instituteCategory?: string;
}

interface FilterOptions {
  years: string[];
  quotas: string[];
  seatTypes: string[];
  genders: string[];
  instituteTypes: string[];
}

// ─────────────────────────────────────────────────────────────
// Autocomplete Input Component
// ─────────────────────────────────────────────────────────────
function AutocompleteInput({
  label, placeholder, endpoint, value, onChange, instType,
}: {
  label: string; placeholder: string; endpoint: string;
  value: string; onChange: (display: string, hidden: string) => void;
  instType?: string;
}) {
  const [display, setDisplay] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (term.length < 1) { setSuggestions([]); setShowDropdown(false); return; }
    setLoading(true);
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();
    try {
      let url = `${API_BASE_URL}/${endpoint}?term=${encodeURIComponent(term)}`;
      if (endpoint === 'suggest-institutes' && instType && instType !== 'All')
        url += `&type=${encodeURIComponent(instType)}`;
      const res = await fetch(url, { signal: controllerRef.current.signal });
      if (!res.ok) throw new Error();
      const data: string[] = await res.json();
      setSuggestions(data.slice(0, MAX_SUGGESTIONS));
      setShowDropdown(true);
    } catch { setSuggestions([]); }
    finally { setLoading(false); }
  }, [endpoint, instType]);

  const handleInput = (val: string) => {
    setDisplay(val);
    onChange(val, '');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  const handleSelect = (item: string) => {
    setDisplay(item);
    onChange(item, item);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setDisplay('');
    onChange('', '');
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">{label}</label>
      <div className="relative">
        <input
          type="text" value={display} placeholder={placeholder}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          className="w-full p-3 py-3 px-3.5 rounded-[10px] border border-white/10 bg-white/5 text-[#e5e5e5] text-[14px] outline-none transition-colors max-w-full font-inherit focus:border-white/30"
        />
        {loading && (
          <Loader2 size={16} className="absolute right-9 top-1/2 -translate-y-1/2 text-[#666] animate-spin" />
        )}
        {display && (
          <button onClick={handleClear} className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-[#888] cursor-pointer text-[18px] p-0.5 hover:text-white transition-colors">
            ×
          </button>
        )}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#1a1a1a] border border-white/10 rounded-[10px] max-h-[200px] overflow-y-auto shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          {suggestions.map((s, i) => (
            <div key={i} onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              className="px-3.5 py-2.5 cursor-pointer text-[#ccc] text-[13px] border-b border-white/5 transition-colors hover:bg-white/5">
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main JoSAA Predictor Page
// ─────────────────────────────────────────────────────────────
export default function JoSAAPage() {
  const { data: session } = useSession();
  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  // Filter state
  const [rank, setRank] = useState('');
  const [seatType, setSeatType] = useState('');
  const [instType, setInstType] = useState('All');
  const [gender, setGender] = useState('');
  const [year, setYear] = useState('');
  const [round, setRound] = useState('');
  const [institute, setInstitute] = useState({ display: '', hidden: '' });
  const [program, setProgram] = useState({ display: '', hidden: '' });
  const [quota, setQuota] = useState('');

  // Auto-populate from session profile
  useEffect(() => {
    if (session?.user) {
        const u = session.user as any;
        if (u.rank && !rank) setRank(u.rank);
        if (u.category && !seatType) setSeatType(u.category);
        if (u.gender && !gender) setGender(u.gender);
    }
  }, [session]);

  // Data state
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [results, setResults] = useState<CollegeResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOptional, setShowOptional] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Trend state
  const [showTrends, setShowTrends] = useState(false);
  const [trendData, setTrendData] = useState<any[] | null>(null);
  const [trendInfo, setTrendInfo] = useState('');
  const [trendLoading, setTrendLoading] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);
  const trendsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  const totalPages = Math.ceil(results.length / PAGE_SIZE);
  const pageData = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Back to top
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Load filter options
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/filter-options`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFilterOptions({
          years: (data.years || []).filter(Boolean).sort((a: number, b: number) => b - a).map(String),
          quotas: (data.quotas || []).filter(Boolean),
          seatTypes: (data.seatTypes || []).filter(Boolean),
          genders: (data.genders || []).filter(Boolean),
          instituteTypes: ['All', ...(data.instituteTypes || []).filter(Boolean).filter((t: string) => t.toLowerCase() !== 'all').sort()],
        });
      } catch {
        setError('Failed to load filter options. Please refresh.');
      }
    })();
  }, []);

  // Rounds based on year
  const roundOptions = (() => {
    if (!year) return [];
    if (ROUND_CONFIG[year]) return [String(ROUND_CONFIG[year])];
    return Array.from({ length: 6 }, (_, i) => String(i + 1));
  })();

  // Search
  const handleSearch = async () => {
    if (!rank && !seatType) {
      setError('Please enter your rank or select a category.');
      return;
    }
    setLoading(true);
    setError('');
    setResults([]);
    setCurrentPage(1);
    try {
      const params: Record<string, string> = {};
      if (rank) params.userRank = rank;
      if (seatType) params.SeatType = seatType;
      if (instType && instType !== 'All') params.instituteType = instType;
      if (gender) params.gender = gender;
      if (year) params.Year = year;
      if (round) params.round = round;
      if (institute.hidden) params.institute = institute.hidden;
      if (program.hidden) params.AcademicProgramName = program.hidden;
      if (quota) params.quota = quota;

      const res = await fetch(`${API_BASE_URL}/filter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Search failed');
      if (!data.filterData || data.filterData.length === 0) {
        setError('No matching colleges found. Try broadening your filters.');
        return;
      }
      setResults(data.filterData);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    } catch (err: any) {
      setError(err.message || 'Search failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRank(''); setSeatType(''); setInstType('All'); setGender(''); setYear(''); setRound('');
    setInstitute({ display: '', hidden: '' }); setProgram({ display: '', hidden: '' }); setQuota('');
    setResults([]); setError(''); setCurrentPage(1); setShowTrends(false);
  };

  // Trends
  const handleShowTrends = async (inst: string, prog: string, st: string, q: string, g: string) => {
    setShowTrends(true);
    setTrendLoading(true);
    setTrendData(null);
    setTrendInfo(`Loading trends for "${prog}" at "${inst}"...`);
    try {
      const res = await fetch(`${API_BASE_URL}/rank-trends`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institute: inst, program: prog, SeatType: st, quota: q, gender: g }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (!data.success || !data.data?.length) {
        setTrendInfo('No historical trend data found for this combination.');
        return;
      }
      setTrendInfo('');
      setTrendData(data.data);
    } catch {
      setTrendInfo('Failed to load trend data.');
    } finally {
      setTrendLoading(false);
      setTimeout(() => trendsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  // Chart rendering
  useEffect(() => {
    if (!trendData || !canvasRef.current) return;
    const loadChart = async () => {
      const { Chart, registerables } = await import('chart.js');
      Chart.register(...registerables);
      if (chartRef.current) chartRef.current.destroy();

      const sorted = [...trendData].sort((a, b) => a.Year !== b.Year ? a.Year - b.Year : (parseInt(String(a.Round)) || 0) - (parseInt(String(b.Round)) || 0));
      const labels = sorted.map(d => `${d.Year}-R${String(d.Round).replace(/[^0-9]/g, '')}`);
      const opening = sorted.map(d => d['Opening Rank'] ?? null);
      const closing = sorted.map(d => d['Closing Rank'] ?? null);
      const userRank = rank ? parseInt(rank) : null;

      chartRef.current = new Chart(canvasRef.current!, {
        type: 'line',
        data: {
          labels,
          datasets: [
            { label: 'Closing Rank', data: closing, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 2.5, tension: 0.3, pointRadius: 4, fill: false, spanGaps: true },
            { label: 'Opening Rank', data: opening, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', borderWidth: 1.5, borderDash: [5, 5], tension: 0.3, pointRadius: 3, fill: false, spanGaps: true },
            ...(userRank ? [{ label: 'Your Rank', data: Array(labels.length).fill(userRank), borderColor: '#ef4444', borderWidth: 2, borderDash: [8, 4], pointRadius: 0, fill: false }] : []),
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' as const, labels: { color: '#ccc', usePointStyle: true } } },
          scales: {
            y: { reverse: true, ticks: { color: '#888', callback: (v: any) => v.toLocaleString() }, grid: { color: 'rgba(255,255,255,0.06)' }, title: { display: true, text: 'Rank', color: '#888' } },
            x: { ticks: { color: '#888', maxRotation: 45 }, grid: { display: false }, title: { display: true, text: 'Year - Round', color: '#888' } },
          },
        },
      });
    };
    loadChart();
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [trendData, rank]);

  // Probability color
  const getProbColor = (p: number) => {
    if (p >= 75) return '#10b981';
    if (p >= 45) return '#f59e0b';
    if (p >= 15) return '#f97316';
    return '#ef4444';
  };

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 pt-[100px] pb-[60px] max-md:pt-[90px] max-md:pb-[40px]">
        {/* Page Title */}
        <div className="text-center mb-10">
          <h1 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-white tracking-[-0.03em] mb-3">
            JoSAA College <span className="text-[#fed802]">Predictor</span>
          </h1>
          <p className="text-[#777] text-[15px] max-w-[500px] mx-auto">
            Find your ideal college based on your JEE rank and preferences.
          </p>
        </div>

        {/* ── PRIMARY FILTERS ── */}
        <div className="bg-white/2 border border-white/5 rounded-[20px] p-8 max-sm:p-5 mb-4">
          <h2 className="font-display text-[18px] font-bold text-white mb-6 pb-4 border-b border-[#fed802]/10 tracking-[-0.02em]">Primary Filters</h2>
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-5">
            <div>
              <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Your JEE Rank <span className="text-red-500">*</span></label>
              <input
                type="number" value={rank} onChange={(e) => setRank(e.target.value)}
                placeholder="Enter your rank (e.g. 15000)" min={1} className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none focus:border-[#fed802]/30 transition-colors"
              />
              <small className="block mt-1 text-[11px] text-[#666]">
                Enter CRL rank for General. For OBC/SC/ST/EWS, enter Category Rank.
              </small>
            </div>
            <div>
              <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Category <span className="text-red-500">*</span></label>
              <select value={seatType} onChange={(e) => setSeatType(e.target.value)} className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none focus:border-[#fed802]/30 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtMSAxIDYgNiA2LTYiLz48L3N2Zz4=')] bg-size-[12px_12px] bg-position-[calc(100%-16px)_center] bg-no-repeat">
                <option value="" className="bg-[#111]">-- Select Category --</option>
                {filterOptions?.seatTypes.map(st => <option key={st} value={st} className="bg-[#111]">{st}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Institute Type</label>
              <select value={instType} onChange={(e) => setInstType(e.target.value)} className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none focus:border-[#fed802]/30 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtMSAxIDYgNiA2LTYiLz48L3N2Zz4=')] bg-size-[12px_12px] bg-position-[calc(100%-16px)_center] bg-no-repeat">
                <option value="All" className="bg-[#111]">-- All Institute Types --</option>
                {filterOptions?.instituteTypes.filter(t => t !== 'All').map(t => <option key={t} value={t} className="bg-[#111]">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none focus:border-[#fed802]/30 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtMSAxIDYgNiA2LTYiLz48L3N2Zz4=')] bg-size-[12px_12px] bg-position-[calc(100%-16px)_center] bg-no-repeat">
                <option value="" className="bg-[#111]">All Genders</option>
                {filterOptions?.genders.map(g => <option key={g} value={g} className="bg-[#111]">{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── OPTIONAL FILTERS TOGGLE ── */}
        <button onClick={() => setShowOptional(!showOptional)}
          className="flex items-center justify-center gap-2 mx-auto mb-4 bg-white/3 border border-white/5 rounded-xl px-6 py-2.5 text-[#999] hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-[14px] font-medium">
          {showOptional ? 'Hide' : 'Show'} Optional Filters
          {showOptional ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* ── OPTIONAL FILTERS ── */}
        {showOptional && (
          <div className="bg-[#080808] border border-white/5 rounded-[20px] p-8 max-sm:p-5 mb-4">
            <h2 className="font-display text-[18px] font-bold text-white mb-6 pb-4 border-b border-[#fed802]/10 tracking-[-0.02em]">Optional Filters</h2>
            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-5">
              <div>
                <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Year</label>
                <select value={year} onChange={(e) => { setYear(e.target.value); setRound(''); }} className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none focus:border-[#fed802]/30 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtMSAxIDYgNiA2LTYiLz48L3N2Zz4=')] bg-size-[12px_12px] bg-position-[calc(100%-16px)_center] bg-no-repeat">
                  <option value="" className="bg-[#111]">All Years</option>
                  {filterOptions?.years.map(y => <option key={y} value={y} className="bg-[#111]">{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Round</label>
                <select value={round} onChange={(e) => setRound(e.target.value)} disabled={!year} className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none focus:border-[#fed802]/30 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtMSAxIDYgNiA2LTYiLz48L3N2Zz4=')] bg-size-[12px_12px] bg-position-[calc(100%-16px)_center] bg-no-repeat disabled:opacity-50 disabled:cursor-not-allowed">
                  <option value="" className="bg-[#111]">{year ? '-- Select Round --' : '-- Select Year First --'}</option>
                  {roundOptions.map(r => <option key={r} value={r} className="bg-[#111]">Round {r}</option>)}
                </select>
              </div>
              <AutocompleteInput label="Institute (optional)" placeholder="Type to search institute..." endpoint="suggest-institutes" value={institute.display} onChange={(d, h) => setInstitute({ display: d, hidden: h })} instType={instType} />
              <AutocompleteInput label="Program (optional)" placeholder="Type to search program..." endpoint="suggest-programs" value={program.display} onChange={(d, h) => setProgram({ display: d, hidden: h })} />
              <div>
                <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Quota</label>
                <select value={quota} onChange={(e) => setQuota(e.target.value)} className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none focus:border-[#fed802]/30 transition-colors cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtMSAxIDYgNiA2LTYiLz48L3N2Zz4=')] bg-size-[12px_12px] bg-position-[calc(100%-16px)_center] bg-no-repeat">
                  <option value="" className="bg-[#111]">All Quotas</option>
                  {filterOptions?.quotas.map(q => <option key={q} value={q} className="bg-[#111]">{q}</option>)}
                </select>
                <small className="block mt-1 text-[11px] text-[#666]">HS(Home State), OS(Other State), AI(All India)</small>
              </div>
            </div>
          </div>
        )}

        {/* ── BUTTONS ── */}
        <div className="flex gap-4 justify-center my-8 flex-wrap max-sm:flex-col">
          <button onClick={handleSearch} disabled={loading} className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[linear-gradient(135deg,#fed802,#fde047)] text-black font-bold text-[15px] font-display rounded-xl uppercase tracking-[1px] transition-all duration-300 shadow-[0_0_20px_rgba(254,216,2,0.2)] hover:shadow-[0_0_30px_rgba(254,216,2,0.4)] disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            {loading ? 'Searching...' : 'Search Colleges'}
          </button>
          <button onClick={handleReset} className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white/5 border border-white/10 text-white font-semibold text-[14px] rounded-xl transition-colors hover:bg-white/10 disabled:opacity-50">
            <RotateCcw size={18} /> Reset Filters
          </button>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-500 text-[14px]">
            {error}
          </div>
        )}

        {/* ── RESULTS ── */}
        {results.length > 0 && (
          <div ref={resultsRef} className="bg-white/2 border border-white/5 rounded-[20px] p-8 max-sm:p-5 mb-4">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5 flex-wrap gap-3">
              <h2 className="font-display text-[22px] font-bold text-white m-0">Matching Colleges</h2>
              <span className="bg-[#fed802]/10 text-[#fed802] px-4 py-1.5 rounded-full text-[13px] font-semibold border border-[#fed802]/15">
                {results.length} results
              </span>
            </div>

            {/* ── Desktop Table View ── */}
            <div className="overflow-x-auto rounded-xl max-md:hidden">
              <table className="w-full border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    {['College Name & Details', 'Program', 'Opening Rank', 'Closing Rank', ...(rank ? ['Probability'] : []), 'Actions'].map((h, i) => (
                      <th key={h} className="p-3.5 px-4 text-[12px] font-bold uppercase tracking-[1px] text-[#888] border-b border-white/10 bg-white/2 whitespace-nowrap" style={{ textAlign: i >= 2 && i <= (rank ? 4 : 3) ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((c, idx) => {
                    const prob = c.probability != null ? c.probability * 100 : null;
                    return (
                      <tr key={idx} className="border-b border-white/5 transition-colors hover:bg-[#fed802]/5">
                        <td className="p-3.5 px-4 text-[14px] color-[#999] align-top">
                          <div className="font-semibold text-[#e5e5e5] mb-1">{c.Institute || 'N/A'}</div>
                          <div className="text-[12px] text-[#666]">{c.Quota || '-'} | {c['Seat Type'] || '-'} | {c.Year || '-'} | R{c.Round || '-'} | {c.Gender || '-'}</div>
                        </td>
                        <td className="p-3.5 px-4 text-[14px] color-[#999] align-top text-[#ccc]">{c['Academic Program Name'] || 'N/A'}</td>
                        <td className="p-3.5 px-4 text-[14px] align-top text-right tabular-nums text-[#ccc]">{c['Opening Rank']?.toLocaleString() || 'N/A'}</td>
                        <td className="p-3.5 px-4 text-[14px] align-top text-right tabular-nums text-[#f59e0b] font-bold">{c['Closing Rank']?.toLocaleString() || 'N/A'}</td>
                        {rank && (
                          <td className="p-3.5 px-4 text-[14px] align-top text-right">
                            {prob != null ? (
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-[50px] h-1.5 rounded-[3px] bg-white/10 overflow-hidden">
                                  <div className="h-full rounded-[3px]" style={{ width: `${prob}%`, backgroundColor: getProbColor(prob) }} />
                                </div>
                                <span className="font-bold text-[13px] tabular-nums" style={{ color: getProbColor(prob) }}>{prob.toFixed(1)}%</span>
                              </div>
                            ) : 'N/A'}
                          </td>
                        )}
                        <td className="p-3.5 px-4 text-[14px] align-top text-center">
                          <div className="flex flex-col gap-2 items-center">
                            <button onClick={() => handleShowTrends(c.Institute, c['Academic Program Name'], c['Seat Type'], c.Quota, c.Gender)}
                              className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3.5 py-1.5 rounded-lg cursor-pointer text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors hover:bg-blue-500/20">
                              <TrendingUp size={14} /> Trends
                            </button>
                            <button 
                              onClick={() => {
                                const id = `JoSAA-${c.Institute}-${c['Academic Program Name']}-${c.Quota}-${c['Seat Type']}-${c.Gender}`;
                                toggleWishlist({
                                  id,
                                  institute: c.Institute,
                                  program: c['Academic Program Name'],
                                  quota: c.Quota,
                                  seatType: c['Seat Type'],
                                  gender: c.Gender,
                                  closingRank: c['Closing Rank'],
                                  openingRank: c['Opening Rank'],
                                  source: 'JoSAA',
                                  year: c.Year,
                                  round: c.Round
                                });
                              }}
                              className={`w-full inline-flex items-center justify-center gap-1.5 border px-3.5 py-1.5 rounded-lg cursor-pointer text-[12px] font-semibold transition-colors ${
                                isInWishlist(`JoSAA-${c.Institute}-${c['Academic Program Name']}-${c.Quota}-${c['Seat Type']}-${c.Gender}`)
                                  ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20'
                                  : 'bg-white/5 border-white/10 text-[#888] hover:bg-white/10 hover:text-white'
                              }`}>
                              <Star size={14} className={isInWishlist(`JoSAA-${c.Institute}-${c['Academic Program Name']}-${c.Quota}-${c['Seat Type']}-${c.Gender}`) ? "fill-yellow-400" : ""} />
                              {isInWishlist(`JoSAA-${c.Institute}-${c['Academic Program Name']}-${c.Quota}-${c['Seat Type']}-${c.Gender}`) ? 'Saved' : 'Save'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Card View ── */}
            <div className="hidden max-md:block">
              {pageData.map((c, idx) => {
                const prob = c.probability != null ? c.probability * 100 : null;
                const details = [c.Quota, c['Seat Type'], c.Gender].filter(Boolean).join(' · ');
                const yearRound = `${c.Year || '-'} · Round ${String(c.Round || '-').replace(/[^0-9]/g, '')}`;
                return (
                  <div key={idx} className="bg-white/3 border border-white/5 rounded-2xl p-5 mb-3 transition-colors hover:border-white/10">
                    <div className="mb-3">
                      <div className="flex-1">
                        <div className="font-bold text-[#e5e5e5] text-[15px] leading-snug mb-1">{c.Institute || 'N/A'}</div>
                        <div className="text-[14px] text-[#999] leading-snug">{c['Academic Program Name'] || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="text-[13px] text-[#666] mb-1.5 leading-snug">{details}</div>
                    <div className="text-[12px] text-[#666] mb-1.5 leading-snug">{yearRound}</div>
                    <div className="flex flex-wrap gap-3 my-3.5 px-4 py-3 bg-white/2 border border-white/5 rounded-xl">
                      <div className="flex flex-col gap-0.5 flex-1 min-w-[70px]">
                        <span className="text-[11px] uppercase tracking-[1px] color-[##666] font-semibold text-[#666]">Opening</span>
                        <span className="text-[18px] font-bold text-[#ccc] tabular-nums">{c['Opening Rank']?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 flex-1 min-w-[70px]">
                        <span className="text-[11px] uppercase tracking-[1px] color-[##666] font-semibold text-[#666]">Closing</span>
                        <span className="text-[18px] font-bold tabular-nums text-[#f59e0b]">{c['Closing Rank']?.toLocaleString() || 'N/A'}</span>
                      </div>
                      {prob != null && (
                        <div className="flex flex-col gap-0.5 flex-1 min-w-[70px]">
                          <span className="text-[11px] uppercase tracking-[1px] color-[##666] font-semibold text-[#666]">Chance</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-[36px] h-[5px] rounded-[3px] bg-white/10 overflow-hidden">
                              <div className="h-full rounded-[3px]" style={{ width: `${prob}%`, backgroundColor: getProbColor(prob) }} />
                            </div>
                            <span className="font-bold text-[14px]" style={{ color: getProbColor(prob) }}>{prob.toFixed(0)}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => handleShowTrends(c.Institute, c['Academic Program Name'], c['Seat Type'], c.Quota, c.Gender)} className="flex-1 py-2.5 px-4 bg-blue-500/5 border border-blue-500/15 text-blue-400 rounded-lg cursor-pointer text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-blue-500/10 hover:border-blue-500/30">
                        <TrendingUp size={14} /> Trends
                      </button>
                      <button 
                        onClick={() => {
                          const id = `JoSAA-${c.Institute}-${c['Academic Program Name']}-${c.Quota}-${c['Seat Type']}-${c.Gender}`;
                          toggleWishlist({
                            id,
                            institute: c.Institute,
                            program: c['Academic Program Name'],
                            quota: c.Quota,
                            seatType: c['Seat Type'],
                            gender: c.Gender,
                            closingRank: c['Closing Rank'],
                            openingRank: c['Opening Rank'],
                            source: 'JoSAA',
                            year: c.Year,
                            round: c.Round
                          });
                        }}
                        className={`flex-1 py-2.5 px-4 border rounded-lg cursor-pointer text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors ${
                          isInWishlist(`JoSAA-${c.Institute}-${c['Academic Program Name']}-${c.Quota}-${c['Seat Type']}-${c.Gender}`)
                            ? 'bg-yellow-500/5 border-yellow-500/15 text-yellow-500 hover:bg-yellow-500/10'
                            : 'bg-white/5 border-white/10 text-[#888] hover:bg-white/10 hover:text-white'
                        }`}>
                        <Star size={14} className={isInWishlist(`JoSAA-${c.Institute}-${c['Academic Program Name']}-${c.Quota}-${c['Seat Type']}-${c.Gender}`) ? "fill-yellow-500" : ""} /> 
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
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3.5 py-2 rounded-lg border border-white/5 bg-white/2 text-[#999] cursor-pointer text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-white/10">Prev</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) page = i + 1;
                  else if (currentPage <= 4) page = i + 1;
                  else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                  else page = currentPage - 3 + i;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`px-3.5 py-2 rounded-lg border cursor-pointer text-[13px] font-semibold transition-colors ${page === currentPage ? 'bg-[#fed802]/10 border-[#fed802]/30 text-[#fed802]' : 'border-white/5 bg-white/2 text-[#999] hover:bg-white/10'}`}>
                      {page}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3.5 py-2 rounded-lg border border-white/5 bg-white/2 text-[#999] cursor-pointer text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:not-disabled:bg-white/10">Next</button>
              </div>
            )}
          </div>
        )}

        {/* ── TRENDS ── */}
        {showTrends && (
          <div ref={trendsRef} className="bg-[#080808] border border-white/5 rounded-[20px] p-8 max-sm:p-5 mt-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-display text-[20px] font-bold text-white m-0">Rank Trends</h2>
              <button onClick={() => setShowTrends(false)} className="flex items-center gap-1.5 px-4 py-2 border border-white/10 bg-white/5 text-[#888] rounded-lg cursor-pointer text-[13px] font-medium transition-colors hover:text-white hover:bg-white/10">
                <X size={14} /> Close
              </button>
            </div>
            {trendInfo && <p className="text-[#888] text-[14px] italic mb-4">{trendInfo}</p>}
            {trendData && (
              <div className="h-[400px] relative w-full">
                <canvas ref={canvasRef} />
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />

      {/* Back to top */}
      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-[44px] h-[44px] rounded-xl bg-[linear-gradient(135deg,#fed802,#fde047)] border-none text-black cursor-pointer shadow-[0_4px_20px_rgba(254,216,2,0.3)] flex items-center justify-center z-50 transition-transform hover:scale-105">
          <ArrowUp size={20} />
        </button>
      )}
    </main>
  );
}
