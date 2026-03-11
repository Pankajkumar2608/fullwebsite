'use client';

import { motion, useInView } from 'framer-motion';
import { Users, Building, TrendingUp, Award } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

const stats = [
    { label: 'Students Guided', value: 50000, suffix: '+', icon: Users, color: '#3b82f6' },
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
        <section className="section" style={{ background: '#050505' }}>
            <div className="divider" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
            <div className="divider" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />

            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ textAlign: 'center', marginBottom: '72px' }}>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-title font-display">
                        Our <span>Impact</span> So Far
                    </motion.h2>
                </div>

                <div className="grid-4">
                    {stats.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="card"
                                style={{ textAlign: 'center', padding: '40px 24px' }}
                            >
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '16px',
                                    background: `${stat.color}10`, border: `1px solid ${stat.color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 24px',
                                }}>
                                    <Icon size={28} color={stat.color} />
                                </div>
                                <div className="font-display" style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, color: '#fff', marginBottom: '8px', letterSpacing: '-0.04em' }}>
                                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                                </div>
                                <div style={{ fontSize: '13px', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                                    {stat.label}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
