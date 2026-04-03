import { motion, useInView } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building, TrendingUp, Award } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

const stats = [
    { label: 'Students Guided', value: 100000, suffix: '+', icon: Users, color: '#3b82f6' },
    { label: 'Colleges Predicted', value: 500000, suffix: '+', icon: Building, color: '#10b981' },
    { label: 'Prediction Accuracy', value: 95, suffix: '%', icon: TrendingUp, color: '#fed802' },
    { label: 'Successful Admissions', value: 50000, suffix: '+', icon: Award, color: '#a855f7' },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;
        const dur = 2000;
        const steps = 60;
        const inc = value / steps;
        let curr = 0;
        const t = setInterval(() => {
            curr += inc;
            if (curr >= value) { setCount(value); clearInterval(t); }
            else setCount(Math.floor(curr));
        }, dur / steps);
        return () => clearInterval(t);
    }, [isInView, value]);

    const fmt = (n: number) => {
        if (n >= 100000) return Math.round(n / 1000) + 'K';
        if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
        return n.toString();
    };

    return <span ref={ref}>{fmt(count)}{suffix}</span>;
}

export function Stats() {
    return (
        <section className="py-24 sm:py-32 relative overflow-visible bg-zinc-900/40 border-y border-border/5">
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border/30 to-transparent" />

            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10 overflow-visible">
                <div className="text-center mb-16">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-5 leading-tight tracking-tight">
                        Our <span className="text-[#fed802]">Impact</span> So Far
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        const MotionCard = motion.create(Card);
                        return (
                            <MotionCard
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="bg-transparent border-none shadow-none text-center relative group overflow-visible"
                            >
                                <CardContent className="p-6 flex flex-col items-center justify-center relative z-10 w-full h-full">
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2 bg-black/40 border border-white/5" style={{ color: stat.color }}>
                                        <Icon size={32} />
                                    </div>
                                    <div className="font-display text-6xl md:text-7xl font-bold tracking-tighter text-white mb-2 tabular-nums drop-shadow-md">
                                        <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground font-semibold uppercase tracking-widest mt-2">
                                        {stat.label}
                                    </div>
                                </CardContent>
                            </MotionCard>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
