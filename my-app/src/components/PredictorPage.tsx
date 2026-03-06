'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Search, RotateCcw, ChevronDown, ChevronUp,
  TrendingUp, X, Loader2, ArrowUp, Star
} from 'lucide-react';

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
      <label style={labelSt}>{label} {required && <span style={{ color: '#ef4444' }}>*</span>}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputSt} disabled={disabled}>
        <option value="">{placeholder}</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <main style={{ minHeight: '100vh', background: '#000' }}>
      <Navbar />
      <div className="predictor-wrapper" style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 24px 60px' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', marginBottom: '12px' }}>
            {config.title.split(' ').map((w, i, arr) => i === arr.length - 1 ? <span key={i} style={{ color: accent }}>{w}</span> : w + ' ')}
          </h1>
          {config.description && <p style={{ color: '#777', fontSize: '15px', maxWidth: '550px', margin: '0 auto' }}>{config.description}</p>}
        </div>

        {optionsLoading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', display: 'block' }} />
            Loading filter options...
          </div>
        )}

        {!optionsLoading && (
          <>
            {/* PRIMARY FILTERS */}
            <div className="predictor-card" style={cardSt}>
              <h2 className="font-display" style={headingSt}>Primary Filters</h2>
              <div className="predictor-filter-grid">
                <div>
                  <label style={labelSt}>Your Rank <span style={{ color: '#ef4444' }}>*</span></label>
                  <input type="number" value={rank} onChange={(e) => setRank(e.target.value)} placeholder="Enter your CRL rank" min={1} style={inputSt} />
                  <small style={{ color: '#666', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                    Enter CRL rank for General. For reserved categories, enter Category Rank.
                  </small>
                </div>
                {renderSelect('Category', seatType, setSeatType, options.seatTypes, 'Select Category', true)}
              </div>
            </div>

            {/* OPTIONAL TOGGLE */}
            <button onClick={() => setShowOptional(!showOptional)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '10px 24px', color: '#999', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
              {showOptional ? 'Hide' : 'Show'} Optional Filters
              {showOptional ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* OPTIONAL FILTERS */}
            {showOptional && (
              <div className="predictor-card" style={{ ...cardSt, background: '#080808' }}>
                <h2 className="font-display" style={headingSt}>Optional Filters</h2>
                <div className="predictor-filter-grid">
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
            <div className="predictor-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'center', margin: '24px 0 40px', flexWrap: 'wrap' }}>
              <button onClick={() => handleSearch(1)} disabled={loading} className="btn-primary" style={{ gap: '10px' }}>
                {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />}
                {loading ? 'Searching...' : 'Predict College'}
              </button>
              <button onClick={handleReset} className="btn-secondary" style={{ gap: '10px' }}>
                <RotateCcw size={18} /> Clear Filters
              </button>
            </div>
          </>
        )}

        {/* ERROR */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', color: '#f87171', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* RESULTS */}
        {results.length > 0 && (
          <div ref={resultsRef} className="predictor-card" style={cardSt}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '12px' }}>
              <h2 className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>Predicted Colleges</h2>
              <span style={{ background: `${accent}15`, color: accent, padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, border: `1px solid ${accent}30` }}>
                {totalCount > 0 ? `${totalCount} results` : `${results.length} results`}
              </span>
            </div>

            {/* ── Desktop Table View ── */}
            <div className="results-table-view" style={{ overflowX: 'auto', borderRadius: '12px', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr>
                    {config.columns.map(col => (
                      <th key={col.key} style={{ ...thSt, textAlign: (col.align || 'left') as any }}>{col.label}</th>
                    ))}
                    <th style={{ ...thSt, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, idx) => (
                    <tr key={row.id || idx}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = `${accent}08`; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                      {config.columns.map(col => {
                        if (col.key === 'details') {
                          const inst = getVal(row, 'institute') || 'N/A';
                          const details = [getVal(row, 'quota'), getVal(row, 'seatType'), getVal(row, 'subCategory'), `${getVal(row, 'year') || '-'} R${getVal(row, 'round') || '-'}`, getVal(row, 'gender')].filter(Boolean).join(' | ');
                          return (
                            <td key={col.key} style={tdSt}>
                              <div style={{ fontWeight: 600, color: '#e5e5e5', marginBottom: '4px' }}>{inst}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>{details}</div>
                            </td>
                          );
                        }
                        if (col.key === 'openingRank' || col.key === 'closingRank') {
                          return <td key={col.key} style={{ ...tdSt, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{fmtRank(getVal(row, col.key))}</td>;
                        }
                        if (col.key === 'program') {
                          return <td key={col.key} style={tdSt}>{getVal(row, 'program') || 'N/A'}</td>;
                        }
                        return <td key={col.key} style={tdSt}>{row[col.key] ?? 'N/A'}</td>;
                      })}
                      <td style={{ ...tdSt, textAlign: 'center' }}>
                        <button onClick={() => handleShowTrends(row)}
                          style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <TrendingUp size={14} /> Trends
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Card View ── */}
            <div className="results-cards-view">
              {results.map((row, idx) => {
                const inst = getVal(row, 'institute') || 'N/A';
                const prog = getVal(row, 'program') || 'N/A';
                const details = [getVal(row, 'quota'), getVal(row, 'seatType'), getVal(row, 'subCategory'), getVal(row, 'gender')].filter(Boolean).join(' · ');
                const yearRound = `${getVal(row, 'year') || '-'} · Round ${getVal(row, 'round') || '-'}`;
                const or = getVal(row, 'openingRank');
                const cr = getVal(row, 'closingRank');
                return (
                  <div key={row.id || idx} className="result-card">
                    <div className="result-card__header">
                      <div style={{ flex: 1 }}>
                        <div className="result-card__institute">{inst}</div>
                        <div className="result-card__program">{prog}</div>
                      </div>
                    </div>
                    <div className="result-card__details">{details}</div>
                    <div className="result-card__details" style={{ fontSize: '12px' }}>{yearRound}</div>
                    <div className="result-card__ranks">
                      {or != null && <div className="result-card__rank-item"><span className="rank-label">Opening</span><span className="rank-value">{fmtRank(or)}</span></div>}
                      <div className="result-card__rank-item"><span className="rank-label">Closing</span><span className="rank-value rank-value--highlight">{fmtRank(cr)}</span></div>
                    </div>
                    <button onClick={() => handleShowTrends(row)} className="result-card__trend-btn">
                      <TrendingUp size={14} /> View Rank Trends
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
                <button onClick={() => handleSearch(currentPage - 1)} disabled={currentPage <= 1} style={pageBtnSt}>Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 5) p = i + 1;
                  else if (currentPage <= 3) p = i + 1;
                  else if (currentPage >= totalPages - 2) p = totalPages - 4 + i;
                  else p = currentPage - 2 + i;
                  return (
                    <button key={p} onClick={() => handleSearch(p)}
                      style={{ ...pageBtnSt, ...(p === currentPage ? activePageSt : {}) }}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => handleSearch(currentPage + 1)} disabled={currentPage >= totalPages} style={pageBtnSt}>Next</button>
              </div>
            )}
          </div>
        )}

        {/* TRENDS */}
        {showTrends && (
          <div ref={trendsRef} className="predictor-card" style={{ ...cardSt, marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="font-display" style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>Rank Trends</h2>
              <button onClick={() => setShowTrends(false)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <X size={14} /> Close
              </button>
            </div>
            {trendInfo && <p style={{ color: '#888', fontSize: '14px', fontStyle: 'italic' }}>{trendInfo}</p>}
            {trendData && <div style={{ height: '400px', position: 'relative' }}><canvas ref={canvasRef} /></div>}
          </div>
        )}
      </div>

      <Footer />

      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ position: 'fixed', bottom: '24px', right: '24px', width: '44px', height: '44px', borderRadius: '12px', background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, border: 'none', color: '#000', cursor: 'pointer', boxShadow: `0 4px 20px ${accent}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <ArrowUp size={20} />
        </button>
      )}

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .predictor-filter-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }

        /* ── Results: Table vs Cards ── */
        .results-table-view { display: block; }
        .results-cards-view { display: none; }

        /* ── Card Styles ── */
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
          font-weight: 700;
          color: #e5e5e5;
          font-size: 15px;
          line-height: 1.4;
          margin-bottom: 4px;
        }
        .result-card__program {
          font-size: 14px;
          color: #999;
          line-height: 1.4;
        }
        .result-card__details {
          font-size: 13px;
          color: #666;
          margin-bottom: 6px;
          line-height: 1.5;
        }
        .result-card__ranks {
          display: flex;
          gap: 16px;
          margin: 14px 0;
          padding: 12px 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 12px;
        }
        .result-card__rank-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }
        .rank-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #666;
          font-weight: 600;
        }
        .rank-value {
          font-size: 18px;
          font-weight: 700;
          color: #ccc;
          font-variant-numeric: tabular-nums;
        }
        .rank-value--highlight { color: #f59e0b; }
        .result-card__trend-btn {
          width: 100%;
          padding: 10px 16px;
          background: rgba(59,130,246,0.06);
          border: 1px solid rgba(59,130,246,0.15);
          color: #60a5fa;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          margin-top: 4px;
        }
        .result-card__trend-btn:hover {
          background: rgba(59,130,246,0.12);
          border-color: rgba(59,130,246,0.3);
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
          .predictor-filter-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </main>
  );
}

// ─── Shared Styles ───
const cardSt: React.CSSProperties = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '32px', marginBottom: '16px' };
const headingSt: React.CSSProperties = { fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(254,216,2,0.1)', letterSpacing: '-0.02em' };
const labelSt: React.CSSProperties = { display: 'block', marginBottom: '8px', fontSize: '14px', color: '#aaa', fontWeight: 600 };
const inputSt: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#e5e5e5', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const, maxWidth: '100%' };
const thSt: React.CSSProperties = { padding: '14px 16px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#888', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', whiteSpace: 'nowrap' };
const tdSt: React.CSSProperties = { padding: '14px 16px', fontSize: '14px', color: '#999', verticalAlign: 'top' };
const pageBtnSt: React.CSSProperties = { padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', color: '#999', cursor: 'pointer', fontSize: '13px', fontWeight: 600 };
const activePageSt: React.CSSProperties = { background: 'rgba(254,216,2,0.1)', borderColor: 'rgba(254,216,2,0.3)', color: '#fed802' };
