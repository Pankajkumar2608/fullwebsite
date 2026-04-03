'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '#predictors', label: 'Predictors' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#resources', label: 'Resources' },
];

import { useScroll, useSpring } from 'framer-motion';

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
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    
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
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-[#fed802]/30 rounded-full blur-md animate-pulse"></div>
                        <Link href="https://ai.motivationkaksha.xyz/login"
                            className="relative font-display bg-gradient-to-br from-[#fed802] to-[#fde047] text-black rounded-full font-bold text-[13px] uppercase tracking-[1.5px] transition-all duration-300 shadow-[0_0_20px_rgba(254,216,2,0.15)] hover:shadow-[0_0_30px_rgba(254,216,2,0.3)] hover:-translate-y-0.5 px-8 py-3 inline-flex items-center justify-center whitespace-nowrap"
                        >
                            Sign Up
                        </Link>
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
                            <Link href="https://ai.motivationkaksha.xyz/login" onClick={() => setIsOpen(false)}
                                className="block pt-4 text-[#fed802] text-base font-bold tracking-wide"
                            >
                                Sign Up &rarr;
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
