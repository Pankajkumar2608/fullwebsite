'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Search, RotateCcw, ChevronDown, ChevronUp,
  TrendingUp, X, Loader2, FileDown, ArrowUp
} from 'lucide-react';

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
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type="text" value={display} placeholder={placeholder}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          style={inputStyle}
        />
        {loading && (
          <Loader2 size={16} style={{ position: 'absolute', right: '36px', top: '50%', transform: 'translateY(-50%)', color: '#666', animation: 'spin 1s linear infinite' }} />
        )}
        {display && (
          <button onClick={handleClear} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px', padding: '2px' }}>
            ×
          </button>
        )}
      </div>
      {showDropdown && suggestions.length > 0 && (
        <div style={dropdownStyle}>
          {suggestions.map((s, i) => (
            <div key={i} onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              style={dropdownItemStyle}>
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
    <main style={{ minHeight: '100vh', background: '#000' }}>
      <Navbar />

      <div className="predictor-wrapper" style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 24px 60px' }}>
        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', marginBottom: '12px' }}>
            JoSAA College <span style={{ color: '#fed802' }}>Predictor</span>
          </h1>
          <p style={{ color: '#777', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
            Find your ideal college based on your JEE rank and preferences.
          </p>
        </div>

        {/* ── PRIMARY FILTERS ── */}
        <div className="predictor-card" style={filterCardStyle}>
          <h2 className="font-display" style={filterHeadingStyle}>Primary Filters</h2>
          <div className="predictor-filter-grid">
            <div>
              <label style={labelStyle}>Your JEE Rank <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="number" value={rank} onChange={(e) => setRank(e.target.value)}
                placeholder="Enter your rank (e.g. 15000)" min={1} style={inputStyle}
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Enter CRL rank for General. For OBC/SC/ST/EWS, enter Category Rank.
              </small>
            </div>
            <div>
              <label style={labelStyle}>Category <span style={{ color: '#ef4444' }}>*</span></label>
              <select value={seatType} onChange={(e) => setSeatType(e.target.value)} style={inputStyle}>
                <option value="">-- Select Category --</option>
                {filterOptions?.seatTypes.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Institute Type</label>
              <select value={instType} onChange={(e) => setInstType(e.target.value)} style={inputStyle}>
                {filterOptions?.instituteTypes.map(t => <option key={t} value={t}>{t === 'All' ? '-- All Institute Types --' : t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={inputStyle}>
                <option value="">All Genders</option>
                {filterOptions?.genders.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── OPTIONAL FILTERS TOGGLE ── */}
        <button onClick={() => setShowOptional(!showOptional)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 24px', color: '#999', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
          {showOptional ? 'Hide' : 'Show'} Optional Filters
          {showOptional ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* ── OPTIONAL FILTERS ── */}
        {showOptional && (
          <div className="predictor-card" style={{ ...filterCardStyle, background: '#080808' }}>
            <h2 className="font-display" style={filterHeadingStyle}>Optional Filters</h2>
            <div className="predictor-filter-grid">
              <div>
                <label style={labelStyle}>Year</label>
                <select value={year} onChange={(e) => { setYear(e.target.value); setRound(''); }} style={inputStyle}>
                  <option value="">All Years</option>
                  {filterOptions?.years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Round</label>
                <select value={round} onChange={(e) => setRound(e.target.value)} style={inputStyle} disabled={!year}>
                  <option value="">{year ? '-- Select Round --' : '-- Select Year First --'}</option>
                  {roundOptions.map(r => <option key={r} value={r}>Round {r}</option>)}
                </select>
              </div>
              <AutocompleteInput label="Institute (optional)" placeholder="Type to search institute..." endpoint="suggest-institutes" value={institute.display} onChange={(d, h) => setInstitute({ display: d, hidden: h })} instType={instType} />
              <AutocompleteInput label="Program (optional)" placeholder="Type to search program..." endpoint="suggest-programs" value={program.display} onChange={(d, h) => setProgram({ display: d, hidden: h })} />
              <div>
                <label style={labelStyle}>Quota</label>
                <select value={quota} onChange={(e) => setQuota(e.target.value)} style={inputStyle}>
                  <option value="">All Quotas</option>
                  {filterOptions?.quotas.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
                <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>HS(Home State), OS(Other State), AI(All India)</small>
              </div>
            </div>
          </div>
        )}

        {/* ── BUTTONS ── */}
        <div className="predictor-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '24px 0 40px', flexWrap: 'wrap' }}>
          <button onClick={handleSearch} disabled={loading} className="btn-primary" style={{ gap: '10px' }}>
            {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />}
            {loading ? 'Searching...' : 'Search Colleges'}
          </button>
          <button onClick={handleReset} className="btn-secondary" style={{ gap: '10px' }}>
            <RotateCcw size={18} /> Reset Filters
          </button>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', color: '#f87171', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* ── RESULTS ── */}
        {results.length > 0 && (
          <div ref={resultsRef} className="predictor-card" style={filterCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '12px' }}>
              <h2 className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>Matching Colleges</h2>
              <span style={{ background: 'rgba(254,216,2,0.08)', color: '#fed802', padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, border: '1px solid rgba(254,216,2,0.15)' }}>
                {results.length} results
              </span>
            </div>

            {/* ── Desktop Table View ── */}
            <div className="results-table-view" style={{ overflowX: 'auto', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr>
                    {['College Name & Details', 'Program', 'Opening Rank', 'Closing Rank', ...(rank ? ['Probability'] : []), 'Trends'].map((h, i) => (
                      <th key={h} style={{ ...thStyle, textAlign: i >= 2 && i <= (rank ? 4 : 3) ? 'right' as const : 'left' as const }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((c, idx) => {
                    const prob = c.probability != null ? c.probability * 100 : null;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(254,216,2,0.03)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                        <td style={tdStyle}>
                          <div style={{ fontWeight: 600, color: '#e5e5e5', marginBottom: '4px' }}>{c.Institute || 'N/A'}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{c.Quota || '-'} | {c['Seat Type'] || '-'} | {c.Year || '-'} | R{c.Round || '-'} | {c.Gender || '-'}</div>
                        </td>
                        <td style={tdStyle}>{c['Academic Program Name'] || 'N/A'}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c['Opening Rank']?.toLocaleString() || 'N/A'}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{c['Closing Rank']?.toLocaleString() || 'N/A'}</td>
                        {rank && (
                          <td style={{ ...tdStyle, textAlign: 'right' }}>
                            {prob != null ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                <div style={{ width: '50px', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                                  <div style={{ width: `${prob}%`, height: '100%', background: getProbColor(prob), borderRadius: '3px' }} />
                                </div>
                                <span style={{ color: getProbColor(prob), fontWeight: 700, fontSize: '13px', fontVariantNumeric: 'tabular-nums' }}>{prob.toFixed(1)}%</span>
                              </div>
                            ) : 'N/A'}
                          </td>
                        )}
                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                          <button onClick={() => handleShowTrends(c.Institute, c['Academic Program Name'], c['Seat Type'], c.Quota, c.Gender)}
                            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                            <TrendingUp size={14} /> Trends
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Card View ── */}
            <div className="results-cards-view">
              {pageData.map((c, idx) => {
                const prob = c.probability != null ? c.probability * 100 : null;
                const details = [c.Quota, c['Seat Type'], c.Gender].filter(Boolean).join(' · ');
                const yearRound = `${c.Year || '-'} · Round ${String(c.Round || '-').replace(/[^0-9]/g, '')}`;
                return (
                  <div key={idx} className="result-card">
                    <div className="result-card__header">
                      <div style={{ flex: 1 }}>
                        <div className="result-card__institute">{c.Institute || 'N/A'}</div>
                        <div className="result-card__program">{c['Academic Program Name'] || 'N/A'}</div>
                      </div>
                    </div>
                    <div className="result-card__details">{details}</div>
                    <div className="result-card__details" style={{ fontSize: '12px' }}>{yearRound}</div>
                    <div className="result-card__ranks">
                      <div className="result-card__rank-item">
                        <span className="rank-label">Opening</span>
                        <span className="rank-value">{c['Opening Rank']?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="result-card__rank-item">
                        <span className="rank-label">Closing</span>
                        <span className="rank-value rank-value--highlight">{c['Closing Rank']?.toLocaleString() || 'N/A'}</span>
                      </div>
                      {prob != null && (
                        <div className="result-card__rank-item">
                          <span className="rank-label">Chance</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <div style={{ width: '36px', height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                              <div style={{ width: `${prob}%`, height: '100%', background: getProbColor(prob), borderRadius: '3px' }} />
                            </div>
                            <span style={{ color: getProbColor(prob), fontWeight: 700, fontSize: '14px' }}>{prob.toFixed(0)}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleShowTrends(c.Institute, c['Academic Program Name'], c['Seat Type'], c.Quota, c.Gender)} className="result-card__trend-btn">
                      <TrendingUp size={14} /> View Rank Trends
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={pageButtonStyle}>Prev</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) page = i + 1;
                  else if (currentPage <= 4) page = i + 1;
                  else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                  else page = currentPage - 3 + i;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      style={{ ...pageButtonStyle, ...(page === currentPage ? activePageStyle : {}) }}>
                      {page}
                    </button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={pageButtonStyle}>Next</button>
              </div>
            )}
          </div>
        )}

        {/* ── TRENDS ── */}
        {showTrends && (
          <div ref={trendsRef} className="predictor-card" style={{ ...filterCardStyle, marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="font-display" style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Rank Trends</h2>
              <button onClick={() => setShowTrends(false)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <X size={14} /> Close
              </button>
            </div>
            {trendInfo && <p style={{ color: '#888', fontSize: '14px', fontStyle: 'italic', marginBottom: '16px' }}>{trendInfo}</p>}
            {trendData && (
              <div style={{ height: '400px', position: 'relative' }}>
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
          style={{ position: 'fixed', bottom: '24px', right: '24px', width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #fed802, #fde047)', border: 'none', color: '#000', cursor: 'pointer', boxShadow: '0 4px 20px rgba(254,216,2,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, transition: 'transform 0.3s' }}>
          <ArrowUp size={20} />
        </button>
      )}

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .predictor-filter-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }

        /* ── Results: Table vs Cards ── */
        .results-table-view { display: block; }
        .results-cards-view { display: none; }

        /* ── Mobile Result Card Styles ── */
        .result-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 12px;
          transition: border-color 0.2s;
        }
        .result-card:hover { border-color: rgba(255,255,255,0.12); }
        .result-card__header { margin-bottom: 12px; }
        .result-card__institute {
          font-weight: 700; color: #e5e5e5; font-size: 15px;
          line-height: 1.4; margin-bottom: 4px;
        }
        .result-card__program { font-size: 14px; color: #999; line-height: 1.4; }
        .result-card__details { font-size: 13px; color: #666; margin-bottom: 6px; line-height: 1.5; }
        .result-card__ranks {
          display: flex; gap: 12px; margin: 14px 0; padding: 12px 16px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
          border-radius: 12px; flex-wrap: wrap;
        }
        .result-card__rank-item { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 70px; }
        .rank-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666; font-weight: 600; }
        .rank-value { font-size: 18px; font-weight: 700; color: #ccc; font-variant-numeric: tabular-nums; }
        .rank-value--highlight { color: #f59e0b; }
        .result-card__trend-btn {
          width: 100%; padding: 10px 16px; background: rgba(59,130,246,0.06);
          border: 1px solid rgba(59,130,246,0.15); color: #60a5fa; border-radius: 10px;
          cursor: pointer; font-size: 13px; font-weight: 600; display: flex;
          align-items: center; justify-content: center; gap: 8px;
          transition: all 0.2s; margin-top: 4px;
        }
        .result-card__trend-btn:hover {
          background: rgba(59,130,246,0.12); border-color: rgba(59,130,246,0.3);
        }

        /* ── Mobile Breakpoints ── */
        @media (max-width: 768px) {
          .results-table-view { display: none !important; }
          .results-cards-view { display: block !important; }
          .predictor-filter-grid { grid-template-columns: 1fr; gap: 16px; }
          .predictor-card { padding: 20px !important; border-radius: 16px !important; }
          .predictor-wrapper { padding: 90px 16px 40px !important; }
          .predictor-buttons { flex-direction: column; align-items: stretch; }
          .predictor-buttons button { width: 100%; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .predictor-filter-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1025px) {
          .predictor-filter-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared Styles
// ─────────────────────────────────────────────────────────────
const filterCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '20px',
  padding: '32px',
  marginBottom: '16px',
};

const filterHeadingStyle: React.CSSProperties = {
  fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '24px', paddingBottom: '16px',
  borderBottom: '1px solid rgba(254,216,2,0.1)', letterSpacing: '-0.02em',
};

// filterGridStyle removed — now handled via CSS class .predictor-filter-grid

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa', fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
  color: '#e5e5e5', fontSize: '14px', outline: 'none', transition: 'border-color 0.3s',
  fontFamily: 'inherit', boxSizing: 'border-box' as const, maxWidth: '100%',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: '4px',
  background: '#000', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
  maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
};

const dropdownItemStyle: React.CSSProperties = {
  padding: '10px 14px', cursor: 'pointer', color: '#ccc', fontSize: '13px',
  borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s',
};

const thStyle: React.CSSProperties = {
  padding: '14px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' as const,
  letterSpacing: '1px', color: '#888', borderBottom: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.02)', whiteSpace: 'nowrap' as const,
};

const tdStyle: React.CSSProperties = {
  padding: '14px 16px', fontSize: '14px', color: '#999', verticalAlign: 'top',
};

const pageButtonStyle: React.CSSProperties = {
  padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)',
  background: 'rgba(255,255,255,0.02)', color: '#999', cursor: 'pointer', fontSize: '13px',
  fontWeight: 600, transition: 'all 0.2s',
};

const activePageStyle: React.CSSProperties = {
  background: 'rgba(254,216,2,0.1)', borderColor: 'rgba(254,216,2,0.3)', color: '#fed802',
};
