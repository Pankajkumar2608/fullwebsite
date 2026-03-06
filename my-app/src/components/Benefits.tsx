'use client';

import { motion } from 'framer-motion';
import { BarChart3, UserCheck, Clock, Gift } from 'lucide-react';

const benefits = [
    { title: 'Data-Driven Accuracy', desc: 'Our algorithm uses verified historical JoSAA, CSAB, and JAC admission data for reliable predictions.', icon: BarChart3, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
    { title: 'Personalized Results', desc: 'Get college suggestions specifically tailored to your unique JEE rank and preferences.', icon: UserCheck, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    { title: 'Time-Saving', desc: 'Instantly find your best-fit engineering colleges without endless manual research.', icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    { title: 'Free & Easy to Use', desc: 'Access valuable insights to guide your college search completely free. Simple and intuitive.', icon: Gift, color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)' },
];

export function Benefits() {
    return (
        <section className="section" style={{ background: '#000' }}>
            <div className="divider" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ textAlign: 'center', marginBottom: '72px' }}>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-title font-display">
                        Why Choose <span>Our Predictor?</span>
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="section-subtitle">
                        Built by students, for students — with accuracy you can trust.
                    </motion.p>
                </div>

                <div className="grid-4">
                    {benefits.map((b, i) => {
                        const Icon = b.icon;
                        return (
                            <motion.div
                                key={b.title}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="card"
                                style={{ textAlign: 'center', padding: '40px 28px' }}
                            >
                                <div className="icon-box" style={{ background: b.bg, borderColor: b.border, margin: '0 auto 24px' }}>
                                    <Icon size={24} color={b.color} />
                                </div>
                                <h3 className="font-display" style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '12px', letterSpacing: '-0.01em' }}>{b.title}</h3>
                                <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.8 }}>{b.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
