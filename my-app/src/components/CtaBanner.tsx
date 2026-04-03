'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function CtaBanner() {
    return (
        <section className="py-24 sm:py-32 relative overflow-visible bg-black w-full border-t border-b border-border/10">
            {/* Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse,rgba(254,216,2,0.12)_0%,transparent_70%)] pointer-events-none" />
            </div>
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent" />

            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10 text-center">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                    <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                        Ready to Find Your<br />
                        <span className="bg-linear-to-br from-[#fed802] to-[#fde047] text-transparent bg-clip-text">
                            Dream College?
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                        Join 15,000+ students who found their perfect engineering college using our free prediction tools.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
                        <Button asChild size="lg" className="h-14 sm:h-[60px] group relative gap-2.5 px-8 sm:px-11 w-full sm:w-auto  text-black font-bold text-sm sm:text-base font-display rounded-2xl uppercase tracking-[1.5px] transition-all duration-500  hover:-translate-y-1 overflow-hidden">
                            <Link href="#predictors">
                                <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent -left-full group-hover:left-full transition-all duration-700 pointer-events-none" />
                                Get Started Free <ArrowRight size={18} />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-14 sm:h-[60px] relative gap-2.5 px-8 sm:px-11 w-full sm:w-auto bg-white/5 backdrop-blur-md text-zinc-300 font-semibold text-sm sm:text-base font-display hover:text-white rounded-2xl border-white/10 transition-all duration-400 hover:bg-white/10 hover:border-white/15 hover:-translate-y-1 tracking-[0.5px]">
                            <a href="https://t.me/Motivation_kaksha" target="_blank" rel="noopener noreferrer">
                                Join Telegram
                            </a>
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
