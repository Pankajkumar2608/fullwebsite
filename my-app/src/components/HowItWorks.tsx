import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, SlidersHorizontal, ListChecks } from 'lucide-react';

const steps = [
    { title: 'Enter Your Rank', desc: 'Input your specific JOSSA, CSAB, or JAC rank. This is crucial for accurate predictions based on historical cutoffs.', icon: Target, color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)' },
    { title: 'Select Preferences', desc: 'Filter by preferred courses, engineering branches, location, or specific colleges you are interested in exploring.', icon: SlidersHorizontal, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
    { title: 'Get Results', desc: 'Receive a personalized list of potential colleges matching your profile, categorized by chances of admission.', icon: ListChecks, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 sm:py-32 relative overflow-visible bg-zinc-950 w-full border-y border-border/10">
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent" />

            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 overflow-visible relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <Badge variant="outline" className="px-5 py-2 rounded-full border-[#fed802]/10 text-[#fed802] tracking-widest uppercase mb-7 bg-[#fed802]/5">
                            ✨ Simple Process
                        </Badge>
                    </motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
                        How It Works in <span className="text-[#fed802]">3 Steps</span>
                    </motion.h2>
                </div>

                {/* Steps Timeline */}
                <div className="relative mt-16 pt-8 pl-6 sm:pl-8">
                    {/* Horizontal Connector Line (Desktop Only) */}
                    <div className="hidden lg:block absolute top-18 left-[5%] right-[5%] h-[2px] bg-white/10 z-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#fed802]/50 via-[#fed802]/20 to-transparent w-full h-full animate-pulse" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8 relative z-10">
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const MotionCard = motion.create(Card);
                            return (
                                <MotionCard
                                    key={step.title}
                                    initial={{ opacity: 0, y: 50, rotateX: 15 }}
                                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, delay: idx * 0.2, type: "spring", stiffness: 100 }}
                                    style={{ transformPerspective: 1000 }}
                                    className="group bg-card/60 backdrop-blur-sm border-white/5 rounded-2xl relative overflow-visible transition-all duration-500 hover:-translate-y-2 hover:border-white/10 shadow-none hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] mt-6 lg:mt-0"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                                    {/* Large watermark number */}
                                    <span className="absolute -top-4 -right-2 sm:-top-6 sm:-right-4 text-[100px] sm:text-[120px] font-black text-white/[0.03] leading-none select-none pointer-events-none group-hover:text-white/[0.05] transition-colors duration-500">
                                        0{idx + 1}
                                    </span>

                                    {/* Timeline Node - Top Center on Desktop, Top Left on Mobile */}
                                    <div className="absolute -top-5 -left-5 lg:left-1/2 lg:-translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-[#fed802] to-[#fde047] text-black font-extrabold text-xl flex items-center justify-center shadow-[0_0_20px_rgba(254,216,2,0.4)] z-20 transform transition-transform duration-500 group-hover:scale-110">
                                        {idx + 1}
                                    </div>

                                    <CardContent className="p-8 sm:p-10 text-left lg:text-center pt-12 lg:pt-14 relative z-10 w-full h-full flex flex-col items-start lg:items-center justify-start">
                                        {/* Icon */}
                                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center border mb-6 transition-transform duration-500 group-hover:scale-110 shrink-0 shadow-lg" style={{ background: step.bg, borderColor: step.border }}>
                                            <Icon size={28} color={step.color} />
                                        </div>

                                        <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4 tracking-tight">{step.title}</h3>
                                        <p className="text-base text-muted-foreground leading-relaxed">{step.desc}</p>
                                    </CardContent>
                                </MotionCard>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
