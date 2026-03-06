'use client';

import { motion } from 'framer-motion';
import { Target, SlidersHorizontal, ListChecks } from 'lucide-react';

const steps = [
    { title: 'Enter Your Rank', desc: 'Input your specific JOSSA, CSAB, or JAC rank. This is crucial for accurate predictions based on historical cutoffs.', icon: Target, color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)' },
    { title: 'Select Preferences', desc: 'Filter by preferred courses, engineering branches, location, or specific colleges you are interested in exploring.', icon: SlidersHorizontal, color: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
    { title: 'Get Results', desc: 'Receive a personalized list of potential colleges matching your profile, categorized by chances of admission.', icon: ListChecks, color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="section" style={{ background: '#000' }}>
            <div className="divider" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />

            <div className="container">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '72px' }}>
                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <span className="section-badge">✨ Simple Process</span>
                    </motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="section-title font-display">
                        How It Works in <span>3 Steps</span>
                    </motion.h2>
                </div>

                {/* Steps */}
                <div className="grid-3">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.15 }}
                                className="card"
                                style={{ textAlign: 'center', padding: '48px 32px', position: 'relative' }}
                            >
                                {/* Large watermark number */}
                                <span style={{
                                    position: 'absolute', top: '16px', right: '24px',
                                    fontSize: '80px', fontWeight: 900, color: 'rgba(255,255,255,0.025)', lineHeight: 1, userSelect: 'none',
                                }}>
                                    0{idx + 1}
                                </span>

                                {/* Number badge */}
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #fed802, #fde047)', color: '#000',
                                    fontWeight: 800, fontSize: '18px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 28px',
                                    boxShadow: '0 0 30px rgba(254,216,2,0.3)',
                                }}>
                                    {idx + 1}
                                </div>

                                {/* Icon */}
                                <div style={{
                                    width: '68px', height: '68px', borderRadius: '18px',
                                    background: step.bg, border: `1px solid ${step.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 24px',
                                }}>
                                    <Icon size={32} color={step.color} />
                                </div>

                                <h3 className="font-display" style={{ fontSize: '20px', fontWeight: 700, color: '#fff', marginBottom: '16px', letterSpacing: '-0.02em' }}>{step.title}</h3>
                                <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.8 }}>{step.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
