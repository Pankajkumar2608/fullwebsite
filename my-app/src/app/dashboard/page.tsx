'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, RotateCcw, Loader2, Star, TrendingUp, Lock } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useSession, signIn } from 'next-auth/react';

const JOSAA_API = 'https://collegepredictorapi.onrender.com/filter';
const CSAB_API = 'https://csabapi.onrender.com/api/colleges';

interface UnifiedRow {
  id: string;
  source: string;
  institute: string;
  program: string;
  quota: string;
  seatType: string;
  gender: string;
  year: string | number;
  round: string | number;
  openingRank: number | null;
  closingRank: number | null;
  probability?: number | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Filters
  const [rank, setRank] = useState('');
  const [seatType, setSeatType] = useState('');
  const [gender, setGender] = useState('');

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UnifiedRow[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!session) {
      signIn('google');
      return;
    }
    if (!rank || !seatType) {
      setError('Rank and Category are required.');
      return;
    }
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const josaaParams: any = { userRank: rank, SeatType: seatType };
      if (gender) josaaParams.gender = gender;
      
      const csabParams = new URLSearchParams({ rank, seatType, limit: '20' });
      if (gender) csabParams.append('gender', gender);

      const [josaaRes, csabRes] = await Promise.allSettled([
        fetch(JOSAA_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(josaaParams)
        }).then(res => res.json()),
        fetch(`${CSAB_API}?${csabParams.toString()}`).then(res => res.json())
      ]);

      const unifiedResults: UnifiedRow[] = [];

      if (josaaRes.status === 'fulfilled' && josaaRes.value.success) {
        const data = josaaRes.value.filterData || [];
        data.slice(0, 20).forEach((c: any) => {
          unifiedResults.push({
            id: `JoSAA-${c.Institute}-${c['Academic Program Name']}-${c.Quota}-${c['Seat Type']}-${c.Gender}`,
            source: 'JoSAA',
            institute: c.Institute || 'N/A',
            program: c['Academic Program Name'] || 'N/A',
            quota: c.Quota || '',
            seatType: c['Seat Type'] || '',
            gender: c.Gender || '',
            year: c.Year || '-',
            round: c.Round || '-',
            openingRank: c['Opening Rank'],
            closingRank: c['Closing Rank'],
            probability: c.probability != null ? c.probability * 100 : null
          });
        });
      }

      if (csabRes.status === 'fulfilled' && csabRes.value.results) {
        const data = csabRes.value.results || [];
        data.forEach((c: any) => {
          unifiedResults.push({
            id: `CSAB-${c.institute}-${c.program_name}-${c.quota}-${c.seat_type}-${c.gender}`,
            source: 'CSAB Special',
            institute: c.institute || 'N/A',
            program: c.program_name || 'N/A',
            quota: c.quota || '',
            seatType: c.seat_type || '',
            gender: c.gender || '',
            year: c.year || '-',
            round: c.round || '-',
            openingRank: c.opening_rank,
            closingRank: c.closing_rank,
            probability: c.probability != null ? c.probability * 100 : null
          });
        });
      }

      if (unifiedResults.length === 0) {
        setError('No seats found matching your criteria.');
      } else {
        // Sort by probability (descending) or closing rank
        unifiedResults.sort((a, b) => {
          const rankA = a.closingRank ?? Infinity;
          const rankB = b.closingRank ?? Infinity;
          return rankA - rankB;
        });
        setResults(unifiedResults);
      }
    } catch (err) {
      setError('Failed to fetch predictions.');
    } finally {
      setLoading(false);
    }
  };

  const getProbColor = (p: number) => {
    if (p >= 75) return '#10b981';
    if (p >= 45) return '#f59e0b';
    if (p >= 15) return '#f97316';
    return '#ef4444';
  };

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-6 pt-[120px] pb-[60px] max-md:pt-[100px]">
        <div className="text-center mb-10">
          <h1 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-white tracking-[-0.03em] mb-3">
            Unified <span className="text-[#fed802]">Dashboard</span>
          </h1>
          <p className="text-[#777] text-[15px] max-w-[600px] mx-auto">
            Check your admission chances across JoSAA and CSAB simultaneously with a single search.
          </p>
        </div>

        {/* Unified Search Form */}
        <div className="bg-white/2 border border-white/5 rounded-[20px] p-8 max-sm:p-5 mb-8">
          <div className="grid grid-cols-3 max-md:grid-cols-1 gap-5">
            <div>
              <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Your JEE Rank <span className="text-red-500">*</span></label>
              <input
                type="number" value={rank} onChange={(e) => setRank(e.target.value)}
                placeholder="Enter CRL or Category Rank" className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none focus:border-[#fed802]/30 transition-colors"
              />
            </div>
            <div>
              <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Category <span className="text-red-500">*</span></label>
              <select value={seatType} onChange={(e) => setSeatType(e.target.value)} className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtMSAxIDYgNiA2LTYiLz48L3N2Zz4=')] bg-size-[12px_12px] bg-position-[calc(100%-16px)_center] bg-no-repeat focus:border-[#fed802]/30">
                <option value="" className="bg-[#111]">-- Select Category --</option>
                <option value="OPEN" className="bg-[#111]">OPEN</option>
                <option value="OBC-NCL" className="bg-[#111]">OBC-NCL</option>
                <option value="SC" className="bg-[#111]">SC</option>
                <option value="ST" className="bg-[#111]">ST</option>
                <option value="EWS" className="bg-[#111]">EWS</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none cursor-pointer appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSI4IiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtMSAxIDYgNiA2LTYiLz48L3N2Zz4=')] bg-size-[12px_12px] bg-position-[calc(100%-16px)_center] bg-no-repeat focus:border-[#fed802]/30">
                <option value="" className="bg-[#111]">Gender-Neutral</option>
                <option value="Female-only (including Supernumerary)" className="bg-[#111]">Female-only</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center mt-8">
            <button onClick={handleSearch} disabled={loading && !!session} className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#fed802] text-black font-bold text-[15px] rounded-xl hover:bg-[#fde047] transition-colors disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide">
              {!session ? <Lock size={18} /> : (loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />)}
              Predict All Boards
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-[14px]">
            {error}
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-white/2 border border-white/5 rounded-[20px] p-8 max-sm:p-5">
            <div className="mb-6 flex gap-4 flex-wrap">
              <h2 className="font-display text-[22px] font-bold text-white m-0 mr-auto">Combined Top Results</h2>
              <span className="bg-white/5 px-4 py-1.5 rounded-full text-[13px] text-[#ccc]">Showing top {results.length} combined matches</span>
            </div>
            
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full border-collapse min-w-[900px]">
                <thead>
                  <tr>
                    {['Board', 'Institute & Details', 'Program', 'Closing Rank', 'Chance', 'Action'].map((h, i) => (
                      <th key={h} className={`p-4 text-[12px] font-bold uppercase tracking-wider text-[#888] bg-white/5 ${i === 3 || i === 4 || i === 5 ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((row) => (
                    <tr key={row.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 align-top">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${row.source === 'JoSAA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                          {row.source}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-semibold text-white mb-1.5">{row.institute}</div>
                        <div className="text-[12px] text-[#666]">{row.quota} | {row.seatType} | {row.gender} | {row.year}-R{row.round}</div>
                      </td>
                      <td className="p-4 align-top text-[#ccc] text-[14px]">{row.program}</td>
                      <td className="p-4 align-top text-right text-[15px] font-semibold text-[#f59e0b] tabular-nums">
                        {row.closingRank?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="p-4 align-top text-right w-[120px]">
                        {row.probability != null ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-bold text-[14px]" style={{ color: getProbColor(row.probability) }}>
                              {row.probability.toFixed(0)}%
                            </span>
                            <div className="w-[60px] h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${row.probability}%`, backgroundColor: getProbColor(row.probability) }} />
                            </div>
                          </div>
                        ) : <span className="text-[#666]">N/A</span>}
                      </td>
                      <td className="p-4 align-top text-right">
                        <button 
                          onClick={() => toggleWishlist(row as any)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border rounded-lg text-[12px] font-semibold transition-colors ${
                            isInWishlist(row.id)
                              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20'
                              : 'bg-white/5 border-white/10 text-[#888] hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Star size={14} className={isInWishlist(row.id) ? "fill-yellow-400" : ""} />
                          {isInWishlist(row.id) ? 'Saved' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
