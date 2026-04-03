import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { ArrowRight, Building2, RefreshCcw, MapPin, GraduationCap, Scale, Calculator, Microscope, Sparkles } from 'lucide-react';
import Link from 'next/link';

const predictors = [
    { title: 'JOSSA Predictor', desc: 'Comprehensive analysis of JoSAA cutoffs with multi-year trends.', icon: Building2, href: '/josaa', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
    { title: 'CSAB Predictor', desc: 'Special round predictions with real-time cutoff analysis.', icon: RefreshCcw, href: '/csab', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    { title: 'UPTU Predictor', desc: 'State-specific predictions for UP technical universities.', icon: MapPin, href: '/uptu', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    { title: 'JAC Delhi', desc: 'Cutoff analysis for DTU, NSUT, IIITD, IGDTUW, DSEU.', icon: MapPin, href: '/jac-delhi', color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)' },
    { title: 'JAC Chandigarh', desc: 'Predictions for UIET & affiliated colleges.', icon: GraduationCap, href: '/jac-chandigarh', color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)' },
    { title: 'College Comparator', desc: 'AI-powered comparison engine for institutions.', icon: Scale, href: '/compare', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
    { title: 'Percentile Converter', desc: 'JEE Main percentile to rank conversion.', icon: Calculator, href: '/percentile', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
    // { title: 'Branch Analyzer Pro', desc: 'Branch-wise analysis with future scope predictions.', icon: Microscope, href: '#', color: '#eab308', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.2)' },
    { title: 'AI Counselor', desc: 'Smart admission guidance powered by ML.', icon: Sparkles, href: '#', color: '#fed802', bg: 'rgba(254,216,2,0.08)', border: 'rgba(254,216,2,0.2)', badge: 'Coming Soon' },
];

export function Predictors() {
    return (
        <section id="predictors" className="py-24 sm:py-32 relative overflow-visible bg-zinc-950/80 w-full">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,rgba(254,216,2,0.07)_0%,transparent_65%)] pointer-events-none z-0" />
            </div>
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10 overflow-visible">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <Badge variant="outline" className="px-5 py-2 rounded-full border-[#fed802]/10 text-[#fed802] tracking-widest uppercase mb-7 bg-[#fed802]/5">
                            🎯 Prediction Suite
                        </Badge>
                    </motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
                        Choose Your <span className="text-[#fed802]">Predictor</span>
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
                        Powered by millions of historical data points to guide your engineering journey.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                    {predictors.map((p, i) => {
                        const Icon = p.icon;
                        const MotionCard = motion.create(Card);
                        return (
                            <Link href={p.href} key={p.title} className={`group flex focus:outline-none ${i === 0 ? 'md:col-span-2' : ''}`}>
                                <MotionCard
                                    initial={{ opacity: 0, y: 25 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.06 }}
                                    className={`flex-1 flex flex-col bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7),0_0_30px_rgba(254,216,2,0.05)] relative overflow-hidden ${i === 0 ? 'border-[#fed802]/30 shadow-[0_0_20px_rgba(254,216,2,0.05)]' : ''}`}
                                >
                                    <div className="absolute inset-0 p-px bg-linear-to-br from-transparent via-[#fed802]/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <CardHeader className="pb-4">
                                        <div className="w-14 h-14 rounded-xl flex items-center justify-center border shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 mb-2" style={{ background: p.bg, borderColor: p.border }}>
                                            <Icon className="w-7 h-7" color={p.color} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CardTitle className={`font-display font-bold tracking-tight text-foreground ${i === 0 ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>{p.title}</CardTitle>
                                            {p.badge && (
                                                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider bg-[#fed802]/10 text-[#fed802] hover:bg-[#fed802]/20 border border-[#fed802]/20">
                                                    {p.badge}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex-1 pb-4 pt-1">
                                        <CardDescription className="text-sm leading-relaxed text-muted-foreground">{p.desc}</CardDescription>
                                    </CardContent>

                                    <CardFooter className="pt-0 border-t-0 mt-auto">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors duration-300 group-hover:text-primary">
                                            {p.badge ? 'Get Early Access' : 'Explore Now'}
                                            <ArrowRight size={16} />
                                        </div>
                                    </CardFooter>
                                </MotionCard>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
