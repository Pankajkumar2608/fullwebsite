'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useWishlist } from '@/hooks/useWishlist';
import { Save, Loader2, Star, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { wishlist, removeFromWishlist, mounted } = useWishlist();

  const [rank, setRank] = useState((session?.user as any)?.rank || '');
  const [category, setCategory] = useState((session?.user as any)?.category || '');
  const [gender, setGender] = useState((session?.user as any)?.gender || '');
  const [state, setState] = useState((session?.user as any)?.state || '');
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // If not logged in, show a state (or just redirect via next-auth middleware ideally)
  if (!session) {
    return (
      <main className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-[160px] text-center text-white">Loading profile... if you are not redirected, please sign in.</div>
      </main>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rank, category, gender, state }),
      });
      
      if (res.ok) {
        // Trigger NextAuth session update so new values are populated across the app immediately
        await update({ rank, category, gender, state });
        setMessage('Profile updated successfully! Predictors will now auto-fill.');
      } else {
        setMessage('Failed to save profile. Please try again.');
      }
    } catch (err) {
      setMessage('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-6 pt-[140px] pb-[80px]">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-12 bg-white/5 border border-white/10 rounded-3xl p-8">
            {session.user?.image && (
                <img src={session.user.image} alt="Profile" className="w-24 h-24 rounded-full border-2 border-[#fed802] shadow-[0_0_20px_rgba(254,216,2,0.2)]" />
            )}
            <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold font-display text-white mb-1">{session.user?.name}</h1>
                <p className="text-[#888]">{session.user?.email}</p>
                <div className="mt-4 flex gap-3 justify-center md:justify-start">
                    <button onClick={() => signOut()} className="px-4 py-1.5 rounded-full border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-colors">Log Out</button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Auto-Fill Settings */}
            <div className="bg-white/2 border border-white/5 rounded-[20px] p-8">
                <h2 className="text-xl font-bold text-white font-display mb-2">Predictor Auto-Fill Settings</h2>
                <p className="text-[#888] text-sm mb-6">Save your counselling details here to automatically populate the JOSAA and CSAB predictors every time you use them.</p>
                
                <form onSubmit={handleSave} className="space-y-5">
                    <div>
                        <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Your JEE Main Rank</label>
                        <input
                            type="number" value={rank} onChange={(e) => setRank(e.target.value)}
                            placeholder="Enter CRL or Category Rank" className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none focus:border-[#fed802]/30 transition-colors"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none cursor-pointer appearance-none">
                                <option value="" className="bg-[#111]">-- Select --</option>
                                <option value="OPEN" className="bg-[#111]">OPEN</option>
                                <option value="OBC-NCL" className="bg-[#111]">OBC-NCL</option>
                                <option value="SC" className="bg-[#111]">SC</option>
                                <option value="ST" className="bg-[#111]">ST</option>
                                <option value="EWS" className="bg-[#111]">EWS</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Gender</label>
                            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none cursor-pointer appearance-none">
                                <option value="" className="bg-[#111]">Gender-Neutral</option>
                                <option value="Female-only (including Supernumerary)" className="bg-[#111]">Female-only</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-[14px] text-[#aaa] font-semibold">Home State (Optional)</label>
                        <input
                            type="text" value={state} onChange={(e) => setState(e.target.value)}
                            placeholder="e.g. Delhi, Maharashtra" className="w-full text-[14px] bg-white/5 border border-white/10 rounded-[10px] px-3.5 py-3 text-white outline-none focus:border-[#fed802]/30 transition-colors"
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm font-medium ${message.includes('success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {message}
                        </div>
                    )}

                    <button type="submit" disabled={saving} className="mt-4 w-full flex items-center justify-center gap-2 bg-[linear-gradient(135deg,#fed802,#fde047)] text-black font-bold py-3.5 rounded-xl uppercase tracking-wide hover:shadow-[0_0_20px_rgba(254,216,2,0.3)] transition-all">
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Settings
                    </button>
                </form>
            </div>

            {/* Mini Wishlist Widget */}
            <div className="bg-white/2 border border-white/5 rounded-[20px] p-8 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                   <div>
                     <h2 className="text-xl font-bold text-white font-display">My Wishlist</h2>
                     <p className="text-[#888] text-sm mt-1">{mounted ? wishlist.length : 0} saved choices</p>
                   </div>
                   <Link href="/wishlist" className="flex items-center gap-1 text-[13px] font-bold text-[#fed802] hover:underline">
                      Full Manager <ArrowRight size={14}/>
                   </Link>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[400px] pr-2 space-y-3 custom-scrollbar">
                    {!mounted ? (
                        <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-white/20"/></div>
                    ) : wishlist.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-6 border border-dashed border-white/10 rounded-xl">
                            <Star size={32} className="text-white/10 mb-3" />
                            <p className="text-[#888] text-sm mb-4">You have not saved any colleges to your wishlist yet.</p>
                            <Link href="/dashboard" className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20 transition-colors">Explore Colleges</Link>
                        </div>
                    ) : (
                        wishlist.slice(0, 5).map((item) => (
                            <div key={item.id} className="bg-white/5 border border-white/5 rounded-xl p-3.5 flex justify-between gap-3 group hover:bg-white/10 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-bold text-[#fed802] uppercase tracking-wider mb-1">{item.source}</div>
                                    <h4 className="text-white text-[13px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">{item.institute}</h4>
                                    <div className="text-[#888] text-[11px] whitespace-nowrap overflow-hidden text-ellipsis leading-relaxed">{item.program}</div>
                                </div>
                                <button onClick={() => removeFromWishlist(item.id)} className="text-red-500/50 hover:text-red-500 transition-colors self-start p-1.5 bg-red-500/10 rounded-lg shrink-0">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                    {mounted && wishlist.length > 5 && (
                        <div className="pt-2">
                             <Link href="/wishlist" className="block w-full py-2.5 text-center bg-white/5 text-[#ccc] text-xs font-bold rounded-xl hover:bg-white/10 transition-colors">
                                View +{wishlist.length - 5} More Choices
                            </Link>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}
