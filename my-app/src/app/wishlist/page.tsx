'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useWishlist } from '@/hooks/useWishlist';
import { Trash2, FileText, Printer, ArrowLeft, Star, Lock } from 'lucide-react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

export default function WishlistPage() {
  const { data: session } = useSession();
  const { wishlist, removeFromWishlist, mounted } = useWishlist();
  const [showChoiceList, setShowChoiceList] = useState(false);

  // Exclude null ranks for proper sorting, or treat them as least competitive (Infinity)
  const sortedChoices = [...wishlist].sort((a, b) => {
    const rankA = a.closingRank ?? Infinity;
    const rankB = b.closingRank ?? Infinity;
    return rankA - rankB;
  });

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-6 pt-[120px] pb-[60px] max-md:pt-[100px]">
        {showChoiceList ? (
          <div className="bg-white/2 border border-white/5 rounded-[20px] p-8 max-sm:p-5">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5 flex-wrap gap-4">
              <div>
                <button onClick={() => setShowChoiceList(false)} className="inline-flex items-center gap-2 text-[#999] hover:text-white transition-colors mb-2 text-[14px]">
                  <ArrowLeft size={16} /> Back to Wishlist
                </button>
                <h1 className="font-display text-[28px] font-bold text-white m-0 tracking-tight">Optimal Choice Filling Order</h1>
                <p className="text-[#888] text-[14px] mt-1">Automatically sorted from most competitive to least competitive based on historical closing ranks.</p>
              </div>
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-[#fed802] text-black px-6 py-2.5 rounded-xl font-bold text-[14px] cursor-pointer hover:bg-[#fde047] transition-colors shadow-[0_0_15px_rgba(254,216,2,0.3)]">
                <Printer size={18} /> Print to PDF
              </button>
            </div>

            <div className="choice-list-print bg-white print:bg-white print:text-black rounded-xl p-6">
              <style jsx global>{`
                @media print {
                  body * { visibility: hidden; }
                  .choice-list-print, .choice-list-print * { visibility: visible; color: black !important; border-color: #ccc !important; }
                  .choice-list-print { position: absolute; left: 0; top: 0; width: 100%; border: none !important; background: white !important; }
                  .choice-list-print th { border-bottom: 2px solid #000 !important; }
                }
              `}</style>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="p-3 text-left text-[14px] font-bold text-black border-b border-gray-300">Pref #</th>
                    <th className="p-3 text-left text-[14px] font-bold text-black border-b border-gray-300">Institute</th>
                    <th className="p-3 text-left text-[14px] font-bold text-black border-b border-gray-300">Program</th>
                    <th className="p-3 text-left text-[14px] font-bold text-black border-b border-gray-300">Quota/Type</th>
                    <th className="p-3 text-right text-[14px] font-bold text-black border-b border-gray-300">Closing Rank (Ref)</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedChoices.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-300">
                      <td className="p-3 text-[14px] text-black font-bold border-b border-gray-200">{idx + 1}</td>
                      <td className="p-3 text-[15px] font-semibold text-black border-b border-gray-200">{item.institute}</td>
                      <td className="p-3 text-[14px] text-black border-b border-gray-200">{item.program}</td>
                      <td className="p-3 text-[14px] text-gray-800 border-b border-gray-200">{item.quota} | {item.seatType} | {item.gender}</td>
                      <td className="p-3 text-[14px] text-black text-right tabular-nums border-b border-gray-200">{item.closingRank?.toLocaleString() || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
              <div>
                <h1 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold text-white tracking-[-0.03em] mb-2">
                  My <span className="text-[#fed802]">Wishlist</span>
                </h1>
                <p className="text-[#888] text-[15px]">You have {wishlist.length} saved colleges.</p>
              </div>
              
              {wishlist.length > 0 && (
                <button onClick={() => {
                    if(!session) {
                        signIn('google', { callbackUrl: '/' });
                        return;
                    }
                    setShowChoiceList(true);
                }} className="inline-flex items-center gap-2 bg-[linear-gradient(135deg,#fed802,#fde047)] text-black px-6 py-3.5 rounded-xl font-bold text-[15px] cursor-pointer hover:shadow-[0_0_30px_rgba(254,216,2,0.4)] transition-all uppercase tracking-wide">
                  {!session ? <Lock size={18} /> : <FileText size={18} />} Generate Choice Filling
                </button>
              )}
            </div>

            {wishlist.length === 0 ? (
              <div className="bg-white/2 border border-white/5 rounded-[20px] p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star size={24} className="text-[#888]" />
                </div>
                <h2 className="text-[20px] font-bold text-white mb-2">Your wishlist is empty</h2>
                <p className="text-[#888] mb-6 max-w-[400px] mx-auto">Start predicting and save the colleges you are interested in to generate your optimal choice filling list.</p>
                <div className="flex gap-4 justify-center">
                  <Link href="/josaa" className="bg-white/10 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-white/15 transition-colors">JoSAA Predictor</Link>
                  <Link href="/csab" className="bg-white/10 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-white/15 transition-colors">CSAB Predictor</Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {wishlist.map((item) => (
                  <div key={item.id} className="bg-white/3 border border-white/5 rounded-[16px] p-5 transition-colors hover:border-white/15 hover:bg-white/5 relative group">
                    <button 
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-4 right-4 text-[#666] hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-500/10 cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="mb-4 pr-8">
                      <span className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold tracking-wider uppercase text-[#fed802] mb-3">
                        {item.source}
                      </span>
                      <h3 className="font-bold text-[#e5e5e5] text-[16px] leading-[1.3] mb-1.5">{item.institute}</h3>
                      <p className="text-[13px] text-[#999] leading-[1.4]">{item.program}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {[item.quota, item.seatType, item.gender].filter(Boolean).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-black/40 border border-white/5 rounded text-[11px] text-[#888]">{tag}</span>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-3 border-t border-white/5">
                      <div className="flex-1">
                        <p className="text-[10px] uppercase text-[#666] tracking-wider mb-0.5 font-semibold">Opening</p>
                        <p className="font-medium text-[15px] text-[#ccc] tabular-nums">{item.openingRank?.toLocaleString() || '-'}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase text-[#666] tracking-wider mb-0.5 font-semibold">Closing</p>
                        <p className="font-medium text-[15px] text-[#f59e0b] tabular-nums">{item.closingRank?.toLocaleString() || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}
