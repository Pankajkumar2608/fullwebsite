'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';

const colleges = [
    'IIT Bombay', 'IIT Delhi', 'IIT Madras', 'IIT Kanpur', 'IIT Kharagpur',
    'NIT Trichy', 'NIT Warangal', 'NIT Surathkal', 'DTU', 'NSUT',
    'IIIT Hyderabad', 'BITS Pilani', 'PEC Chandigarh', 'NIT Calicut',
    'IIT Roorkee', 'IIT Guwahati', 'IIT Hyderabad', 'NIT Allahabad',
];

function Particles() {
    const particles = useMemo(() =>
        Array.from({ length: 40 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            size: Math.random() * 3 + 3,
            delay: Math.random() * 8,
            duration: Math.random() * 8 + 8,
            opacity: Math.random() * 0.4 + 0.1,
        })), []);

    return (
        <>
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="particle"
                    style={{
                        left: `${p.left}%`,
                        bottom: '-20px',
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                        opacity: p.opacity,
                    }}
                />
            ))}
        </>
    );
}

export function Hero() {
    return (
        <section style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            paddingTop: '110px',
            paddingBottom: '40px',
            overflow: 'hidden',
        }}>
            {/* Glow */}
            <div style={{
                position: 'absolute', top: '-250px', left: '50%', transform: 'translateX(-50%)',
                width: '1000px', height: '800px',
                background: 'radial-gradient(ellipse, rgba(254,216,2,0.1) 0%, rgba(254,216,2,0.02) 45%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Grid pattern */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.025,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                backgroundSize: '80px 80px', pointerEvents: 'none',
            }} />

            {/* Particles */}
            <Particles />

            <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '950px' }}>
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    style={{ marginBottom: '36px' }}
                >
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '10px',
                        padding: '10px 24px', borderRadius: '9999px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        color: '#999', fontSize: '13px', fontWeight: 500, letterSpacing: '0.5px',
                    }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 12px rgba(74,222,128,0.5)' }} />
                        Trusted by 1 Lakh+ JEE Aspirants
                    </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.25 }}
                    className="font-display"
                    style={{
                        fontSize: 'clamp(3rem, 8vw, 6rem)',
                        fontWeight: 700,
                        color: '#fff',
                        lineHeight: 1.0,
                        letterSpacing: '-0.01em',
                        marginBottom: '32px',
                    }}
                >
                    Predict Your<br />
                    <span
                        className= "cursive"
                        style={{
                            background: 'linear-gradient(135deg, #fed802 0%, #fde047 40%, #f59e0b 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Ideal College
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.45 }}
                    style={{
                        fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                        color: '#777', maxWidth: '650px', margin: '0 auto 52px', lineHeight: 1.8,
                    }}
                >
                    Get accurate, data-driven college predictions based on your JEE Rank for{' '}
                    <span style={{ color: '#ccc', fontWeight: 600 }}>JoSAA</span>,{' '}
                    <span style={{ color: '#ccc', fontWeight: 600 }}>CSAB</span>,{' '}
                    <span style={{ color: '#ccc', fontWeight: 600 }}>JAC Delhi</span> &{' '}
                    <span style={{ color: '#ccc', fontWeight: 600 }}>JAC Chandigarh</span> counselling.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.6 }}
                    style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '80px' }}
                >
                    <a href="#predictors" className="btn-primary">Find Your Best Fit</a>
                    <a href="#how-it-works" className="btn-secondary">How It Works</a>
                </motion.div>

                {/* Scrolling Marquee of College Names */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                >
                    <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#444', fontWeight: 600, marginBottom: '16px' }}>
                        Covering 300+ Engineering Colleges
                    </p>
                    <div className="marquee-container" style={{ height: '36px' }}>
                        <div className="marquee-track" style={{ gap: '8px' }}>
                            {[...colleges, ...colleges].map((name, i) => (
                                <span key={i} style={{
                                    padding: '6px 18px', borderRadius: '9999px',
                                    background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)',
                                    color: '#555', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', marginRight: '8px',
                                }}>
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1.8 }}
                style={{ position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)' }}
                className="animate-bounce"
            >
                <ChevronDown size={22} color="#fff" />
            </motion.div>
        </section>
    );
}
