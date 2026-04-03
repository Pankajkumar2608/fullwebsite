import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, UserCheck, Clock, Gift } from 'lucide-react';

const benefits = [
    { title: 'Data-Driven Accuracy', desc: 'Our algorithm uses verified historical JoSAA, CSAB, and JAC admission data for reliable predictions.', icon: BarChart3, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
    { title: 'Personalized Results', desc: 'Get college suggestions specifically tailored to your unique JEE rank and preferences.', icon: UserCheck, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    { title: 'Time-Saving', desc: 'Instantly find your best-fit engineering colleges without endless manual research.', icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    { title: 'Free & Easy to Use', desc: 'Access valuable insights to guide your college search completely free. Simple and intuitive.', icon: Gift, color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)' },
];

export function Benefits() {
    return (
        <section className="py-24 sm:py-32 relative overflow-visible bg-black w-full border-b border-white/5">
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent" />
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10 overflow-visible">
                <div className="text-center mb-16">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
                        Why Choose <span className="text-[#fed802]">Our Predictor?</span>
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
                        Built by students, for students — with accuracy you can trust.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((b, i) => {
                        const Icon = b.icon;
                        const MotionCard = motion.create(Card);
                        return (
                            <MotionCard
                                key={b.title}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="group bg-card/60 backdrop-blur-sm rounded-2xl relative overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-none hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.9)] border-y border-r border-y-white/5 border-r-white/5 border-l-4"
                                style={{ borderLeftColor: b.color }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                
                                <CardContent className="p-8 sm:p-10 text-left flex flex-col items-start justify-start relative z-10 h-full">
                                    <div className="mb-6 shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 relative z-10">
                                        <Icon size={32} color={b.color} />
                                    </div>
                                    <h3 className="font-display text-xl font-bold text-white mb-3 tracking-tight relative z-10">{b.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{b.desc}</p>
                                </CardContent>
                            </MotionCard>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
