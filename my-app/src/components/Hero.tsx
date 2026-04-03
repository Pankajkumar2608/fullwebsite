'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Caveat } from 'next/font/google';

const colleges = [
    'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
    'NIT Trichy', 'NIT Warangal', 'NIT Surathkal', 'DTU', 'NSUT',
    'IIIT Hyderabad', 'BITS Pilani', 'PEC Chandigarh', 'NIT Calicut',
    'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad', 'NIT Allahabad',
];

const cursive = Caveat({
    weight: '400',
    subsets: ['latin'],
    display: 'swap',
});

// Floating orbs — subtle depth, not distracting
function FloatingOrbs() {
    return (
        <>
            {/* Large primary orb — top center */}
            <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[600px] rounded-full bg-[radial-gradient(ellipse,rgba(254,216,2,0.12)_0%,rgba(254,216,2,0.03)_50%,transparent_70%)] pointer-events-none blur-3xl" />
            {/* Secondary orb — bottom left */}
            <div className="absolute bottom-[10%] left-[-100px] w-[400px] h-[400px] rounded-full bg-[radial-gradient(ellipse,rgba(254,216,2,0.05)_0%,transparent_70%)] pointer-events-none blur-2xl" />
            {/* Accent orb — top right */}
            <div className="absolute top-[20%] right-[-80px] w-[300px] h-[300px] rounded-full bg-[radial-gradient(ellipse,rgba(254,216,2,0.04)_0%,transparent_70%)] pointer-events-none blur-2xl" />
        </>
    );
}

// Fine dot grid — more refined than line grid
function DotGrid() {
    return (
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
            }}
        />
    );
}

// Stat pills — social proof inline with hero
const stats = [
    { value: '1L+', label: 'Students' },
    { value: '95%', label: 'Accuracy' },
    { value: '300+', label: 'Colleges' },
];

export function Hero() {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
    const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen flex flex-col items-center justify-center bg-black pt-28 pb-12 overflow-hidden"
        >
            <FloatingOrbs />
            <DotGrid />

            {/* Subtle horizontal scan line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#fed802]/20 to-transparent" />

            <motion.div
                style={{ y, opacity }}
                className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center w-full"
            >
                {/* Trust badge */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                    className="mb-8"
                >
                    <span className="inline-flex flex-row items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border border-white/8 bg-white/[0.03] text-[#888] text-[9px] sm:text-[12px] font-medium tracking-wide sm:tracking-[1px] uppercase backdrop-blur-sm whitespace-nowrap max-w-full">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                        <span className="truncate">Trusted by 1 Lakh+ JEE Aspirants</span>
                    </span>
                </motion.div>

                {/* Main headline — two-line, dramatic size */}
                <div
                >
                    <h1 className="font-display font-black leading-[0.95] tracking-tighter mb-6 w-full">
                        <span className="block text-[3rem] sm:text-[4.5rem] md:text-[6.5rem] lg:text-[7.5rem] text-white">
                            Predict Your
                        </span>
                        {/* Yellow headline with layered glow */}
                        <span className={`${cursive.className} block text-[3.4rem] sm:text-[5rem] md:text-[7rem] lg:text-[8rem] italic relative mt-0 sm:mt-1`}>
                            <span className="relative z-10 bg-[linear-gradient(135deg,#fed802_0%,#fde047_40%,#f59e0b_100%)] text-transparent bg-clip-text pr-2 md:pr-4">
                                Ideal College
                            </span>

                            {/* Glow smear behind text - adjusted for the new font shape */}
                            <span className="absolute inset-0 blur-2xl opacity-20 text-[#fed802] select-none pointer-events-none translate-y-2 pr-2 md:pr-4" aria-hidden>
                                Ideal College
                            </span>
                        </span>
                    </h1>
                </div>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
                    className="text-[clamp(0.875rem,2vw,1.125rem)] text-zinc-500 max-w-[600px] mx-auto mb-10 leading-relaxed px-2"
                >
                    Accurate, data-driven predictions for{' '}
                    <span className="text-zinc-300 font-semibold">JoSAA</span>,{' '}
                    <span className="text-zinc-300 font-semibold">CSAB</span>,{' '}
                    <span className="text-zinc-300 font-semibold">JAC Delhi</span> &{' '}
                    <span className="text-zinc-300 font-semibold">JAC Chandigarh</span>{' '}
                    — based on your JEE rank.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.55, ease: 'easeOut' }}
                    className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16"
                >
                    {/* Primary CTA — yellow, pulsing glow */}
                    <div className="relative w-full sm:w-auto">
                        <div className="absolute -inset-1 rounded-2xl" />
                        <Button
                            asChild
                            size="lg"
                            className="relative h-13 px-9 w-full sm:w-auto bg-[#fed802] text-black font-bold font-display text-sm uppercase tracking-[1.5px] rounded-xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden group"
                        >
                            <a href="#predictors">
                                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                Find Your Best Fit
                                <ArrowRight size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform duration-300" />
                            </a>
                        </Button>
                    </div>

                    {/* Secondary CTA — ghost */}
                    <Button
                        asChild
                        variant="ghost"
                        size="lg"
                        className="h-13 px-8 w-full sm:w-auto text-zinc-400 hover:text-white font-medium font-display text-sm rounded-xl border border-white/8 hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-0.5 tracking-wide"
                    >
                        <a href="#how-it-works">
                            How It Works
                        </a>
                    </Button>
                </motion.div>

                {/* College marquee */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.9 }}
                >
                    <p className="text-[10px] tracking-[3.5px] uppercase text-zinc-700 font-semibold mb-4">
                        Covering 300+ Engineering Colleges
                    </p>
                    {/* Double marquee — opposite directions for depth */}
                    <div className="space-y-2.5 pb-1.0 overflow-hidden">
                        {[false, true].map((reverse, rowIdx) => (
                            <div
                                key={rowIdx}
                                className="relative whitespace-nowrap"
                                style={{
                                    maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
                                }}
                            >
                                <div
                                    className="inline-flex gap-2.5"
                                    style={{
                                        animation: `marquee ${reverse ? '45s' : '55s'} linear infinite ${reverse ? 'reverse' : ''}`,
                                    }}
                                >
                                    {[...colleges, ...colleges, ...colleges].map((name, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center px-3.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] text-zinc-600 text-[11px] font-medium tracking-wide"
                                        >
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
            >
                <span className="text-[10px] tracking-[2px] uppercase text-zinc-700">Scroll</span>
                <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <ChevronDown size={18} className="text-zinc-700" />
                </motion.div>
            </motion.div>
        </section>
    );
}