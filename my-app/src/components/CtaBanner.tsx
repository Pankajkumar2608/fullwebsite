'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CtaBanner() {
    return (
        <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Glow */}
            <div style={{
                position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
                width: '700px', height: '500px',
                background: 'radial-gradient(ellipse, rgba(254,216,2,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div className="divider" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />

            <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                    <h2 className="font-display" style={{
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: '#fff',
                        marginBottom: '24px', lineHeight: 1.15, letterSpacing: '-0.02em',
                    }}>
                        Ready to Find Your<br />
                        <span style={{
                            background: 'linear-gradient(135deg, #fed802, #fde047)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>
                            Dream College?
                        </span>
                    </h2>
                    <p style={{ fontSize: '18px', color: '#888', maxWidth: '550px', margin: '0 auto 40px', lineHeight: 1.7 }}>
                        Join 15,000+ students who found their perfect engineering college using our free prediction tools.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="#predictors" className="btn-primary">
                            Get Started Free <ArrowRight size={18} />
                        </a>
                        <a href="https://t.me/Motivation_kaksha" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                            Join Telegram
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
