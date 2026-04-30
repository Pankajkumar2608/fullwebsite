'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Menu, X, Bell, LogOut, User } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { usePostHog } from "posthog-js/react";


const navLinks = [
    { href: '/', label: 'Home' },
   // { href: '/dashboard', label: 'Dashboard' },
    { href: '/wishlist', label: 'Wishlist' },
    { href: '/#predictors', label: 'Predictors' },
   { href: '/#how-it-works', label: 'How It Works' },
];

function useActiveSection(sectionIds: string[]) {
    const [activeSection, setActiveSection] = useState<string>('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -80% 0px' } // triggers when section is near top
        );

        sectionIds.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [sectionIds]);

    return activeSection;
}

export function Navbar() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeEvents, setActiveEvents] = useState<any[]>([]);
    const posthog = usePostHog();

    useEffect(() => {
      if (session?.user?.email) {
        posthog.identify(session.user.email, {
          email: session.user.email,
          name: session.user.name,
        });
      }
    }, [session]);

    useEffect(() => {
        fetch('/api/news')
            .then(res => res.json())
            .then(res => {
                if(res.success) setActiveEvents(res.data);
            })
            .catch(err => console.error("Could not fetch live updates", err));
    }, []);
    
    // Scroll progress
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Active section spy
    const sectionIds = navLinks.map(link => link.href.startsWith('#') ? link.href.substring(1) : '').filter(Boolean);
    const activeSectionId = useActiveSection(sectionIds);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ease-in-out backdrop-blur-xl ${scrolled ? 'bg-black/80 border-b border-white/5 shadow-2xl' : 'bg-transparent border-b border-transparent'}`}>
            {/* Scroll Progress Bar */}
            <motion.div 
                className="absolute top-0 left-0 right-0 h-[2px] bg-[#fed802] origin-left z-50 shadow-[0_0_10px_#fed802]"
                style={{ scaleX }}
            />

            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-[#fed802] rounded-md">
                    <img src="/motivation kaksha logo.png" alt="Motivation Kaksha" className="h-[38px] w-auto object-contain" />
                </Link>

                {/* Desktop */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => {
                        const isWindowDefined = typeof window !== 'undefined';
                        const isActive = link.href === '/' ? activeSectionId === '' && (!isWindowDefined || window.scrollY < 300) : link.href === `#${activeSectionId}`;
                        return (
                            <Link key={link.label} href={link.href}
                                className={`relative font-display text-[14px] font-medium tracking-[0.5px] transition-colors duration-300 ${isActive ? 'text-[#fed802]' : 'text-muted-foreground hover:text-white'}`}
                            >
                                {link.label}
                                {isActive && (
                                    <motion.div 
                                        layoutId="navbar-indicator"
                                        className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#fed802] shadow-[0_0_8px_#fed802]"
                                    />
                                )}
                            </Link>
                        );
                    })}
                    {session ? (
                        <div className="relative inline-block group">
                            <button className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
                                {session.user?.image ? (
                                    <img src={session.user.image} alt="Avatar" className="w-6 h-6 rounded-full" />
                                ) : (
                                    <User size={16} />
                                )}
                                <span className="text-[13px] font-bold text-white max-w-[100px] truncate">{session.user?.name?.split(' ')[0]}</span>
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-[160px] bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <Link href="/profile" className="block w-full text-left px-4 py-3 text-[13px] text-[#ccc] hover:bg-white/5 hover:text-white transition-colors">
                                    <div className="flex items-center gap-2">
                                        <User size={16} /> My Profile
                                    </div>
                                </Link>
                                <button onClick={() => signOut()} className="w-full text-left px-4 py-3 text-[13px] text-red-500 hover:bg-white/5 flex items-center gap-2 border-t border-white/5">
                                    <LogOut size={16} /> Log Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-[#fed802]/30 rounded-full blur-md animate-pulse"></div>
                            <button onClick={() => signIn('google', { callbackUrl: '/' })}
                                className="relative font-display bg-[linear-gradient(135deg,#fed802,#fde047)] text-black rounded-full font-bold text-[13px] uppercase tracking-[1.5px] transition-all duration-300 shadow-[0_0_20px_rgba(254,216,2,0.15)] hover:shadow-[0_0_30px_rgba(254,216,2,0.3)] hover:-translate-y-0.5 px-8 py-3 inline-flex items-center justify-center whitespace-nowrap cursor-pointer border-none"
                            >
                                Sign In / Up
                            </button>
                        </div>
                    )}
                    <div className="relative inline-block ml-2">
                        <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-zinc-400 hover:text-[#fed802] transition-colors focus:outline-none rounded-full hover:bg-white/5">
                            <Bell size={20} />
                            {activeEvents.length > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-black" />
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-4 w-[320px] bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 p-2"
                                >
                                    <div className="p-3 border-b border-white/5 flex justify-between items-center">
                                        <h3 className="font-bold text-white text-[14px]">Upcoming Deadlines</h3>
                                        {activeEvents.length > 0 && <span className="text-[11px] font-bold text-[#fed802] bg-[#fed802]/10 px-2 py-0.5 rounded-md">{activeEvents.length} New</span>}
                                    </div>
                                    <div className="max-h-[320px] overflow-y-auto pt-2 pb-1 custom-scrollbar">
                                        {activeEvents.length === 0 ? (
                                            <div className="p-6 text-center text-[#888] text-[13px]">No upcoming events right now.</div>
                                        ) : (
                                            activeEvents.map((evt) => (
                                                <a key={evt.id} href={evt.url} target="_blank" rel="noopener noreferrer" className="block p-3 mb-1.5 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                                                    <div className="flex justify-between items-start mb-1.5">
                                                        <span className="text-[10px] uppercase font-bold text-[#fed802] tracking-wider bg-[#fed802]/5 px-1.5 py-0.5 rounded-sm">{evt.board}</span>
                                                    </div>
                                                    <h4 className="text-white text-[13px] font-semibold mb-1 leading-snug">{evt.title}</h4>
                                                    <p className="text-[#999] text-[12px] leading-snug flex items-center gap-1 font-bold text-blue-400">View Notice</p>
                                                </a>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Mobile */}
                <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white transition-colors hover:text-[#fed802] focus:outline-none">
                    {isOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden bg-zinc-950/95 backdrop-blur-3xl border-t border-white/5 md:hidden"
                    >
                        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 py-6 pb-8 space-y-2">
                            {navLinks.map((link) => (
                                <Link key={link.label} href={link.href} onClick={() => setIsOpen(false)}
                                    className="block py-3 text-muted-foreground hover:text-white transition-colors text-base font-medium border-b border-white/5"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {session ? (
                                <button onClick={() => signOut()} className="block w-full text-left pt-4 text-red-500 text-base font-bold tracking-wide">
                                    Log Out
                                </button>
                            ) : (
                                <button onClick={() => { setIsOpen(false); signIn('google', { callbackUrl: '/' }); }}
                                    className="block w-full text-left pt-4 text-[#fed802] text-base font-bold tracking-wide cursor-pointer border-none bg-transparent"
                                >
                                    Sign In / Up &rarr;
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
