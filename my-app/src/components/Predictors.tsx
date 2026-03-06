'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Building2, RefreshCcw, MapPin, GraduationCap, Scale, Calculator, Microscope, Sparkles } from 'lucide-react';

const predictors = [
    { title: 'JOSSA Predictor', desc: 'Comprehensive analysis of JoSAA cutoffs with multi-year trends.', icon: Building2, href: '/josaa', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
    { title: 'CSAB Predictor', desc: 'Special round predictions with real-time cutoff analysis.', icon: RefreshCcw, href: '/csab', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    { title: 'UPTU Predictor', desc: 'State-specific predictions for UP technical universities.', icon: MapPin, href: '/uptu', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    { title: 'JAC Delhi', desc: 'Cutoff analysis for DTU, NSUT, IIITD, IGDTUW, DSEU.', icon: MapPin, href: '/jac-delhi', color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)' },
    { title: 'JAC Chandigarh', desc: 'Predictions for UIET & affiliated colleges.', icon: GraduationCap, href: '/jac-chandigarh', color: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)' },
    { title: 'College Comparator', desc: 'AI-powered comparison engine for institutions.', icon: Scale, href: '/compare', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
    { title: 'Percentile Converter', desc: 'JEE Main percentile to rank conversion.', icon: Calculator, href: '/percentile', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
    { title: 'Branch Analyzer Pro', desc: 'Branch-wise analysis with future scope predictions.', icon: Microscope, href: '#', color: '#eab308', bg: 'rgba(234,179,8,0.08)', border: 'rgba(234,179,8,0.2)' },
    { title: 'AI Counselor', desc: 'Smart admission guidance powered by ML.', icon: Sparkles, href: '#', color: '#fed802', bg: 'rgba(254,216,2,0.08)', border: 'rgba(254,216,2,0.2)', badge: 'Coming Soon' },
];

export function Predictors() {
    return (
        <section id="predictors" className="section" style={{ background: 'linear-gradient(180deg, #000 0%, #050505 50%, #000 100%)' }}>
            <div className="glow-top" />
            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '72px' }}>
                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <span className="section-badge">🎯 Prediction Suite</span>
                    </motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="section-title font-display">
                        Choose Your <span>Predictor</span>
                    </motion.h2>
                    <motion.p initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="section-subtitle">
                        Powered by millions of historical data points to guide your engineering journey.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid-3">
                    {predictors.map((p, i) => {
                        const Icon = p.icon;
                        return (
                            <motion.a
                                href={p.href}
                                key={p.title}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.06 }}
                                className="card-glow"
                                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
                            >
                                {/* Icon */}
                                <div className="icon-box" style={{ background: p.bg, borderColor: p.border, marginBottom: '24px' }}>
                                    <Icon size={24} color={p.color} />
                                </div>

                                {/* Title */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <h3 className="font-display" style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{p.title}</h3>
                                    {p.badge && (
                                        <span style={{
                                            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px',
                                            background: 'rgba(254,216,2,0.1)', color: '#fed802', border: '1px solid rgba(254,216,2,0.2)',
                                            padding: '4px 12px', borderRadius: '9999px', whiteSpace: 'nowrap',
                                        }}>
                                            {p.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Desc */}
                                <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7, marginBottom: '24px', flex: 1 }}>{p.desc}</p>

                                {/* CTA */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600, color: '#555', transition: 'color 0.3s' }}>
                                    {p.badge ? 'Get Early Access' : 'Explore Now'}
                                    <ArrowRight size={16} />
                                </div>
                            </motion.a>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
