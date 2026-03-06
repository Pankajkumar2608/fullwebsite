'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    { name: 'Arun Sharma', college: 'NIT Trichy - CSE', text: 'The JoSAA predictor was spot-on! It predicted NIT Trichy CSE within my rank range and that\'s where I got admitted.', rating: 5 },
    { name: 'Priya Verma', college: 'DTU - ECE', text: 'I was confused between JoSAA and JAC Delhi. The comparison feature helped me understand my chances clearly.', rating: 5 },
    { name: 'Rahul Singh', college: 'IIIT Hyderabad - IT', text: 'The percentile to rank converter was incredibly useful during result season. Very accurate and helpful.', rating: 5 },
    { name: 'Sneha Gupta', college: 'NIT Warangal - MechE', text: 'Used the Branch Analyzer to understand future scope. The cutoff trends were very helpful too.', rating: 4 },
    { name: 'Vikram Patel', college: 'PEC Chandigarh - CSE', text: 'The JAC Chandigarh predictor is the only tool that covers PEC and UIET properly. Thank you!', rating: 5 },
    { name: 'Ananya Rao', college: 'NSUT - IT', text: 'Simple interface with accurate predictions. Checked 3 different counselling processes from one platform.', rating: 5 },
];

export function Testimonials() {
    return (
        <section className="section" style={{ background: '#050505' }}>
            <div className="divider" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
            <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                <div style={{ textAlign: 'center', marginBottom: '72px' }}>
                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <span className="section-badge">⭐ Student Reviews</span>
                    </motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="section-title font-display">
                        What Students <span>Say</span>
                    </motion.h2>
                </div>

                <div className="grid-3">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            className="card"
                            style={{ position: 'relative' }}
                        >
                            <Quote size={32} style={{ position: 'absolute', top: '24px', right: '24px', color: 'rgba(255,255,255,0.03)' }} />

                            {/* Stars */}
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                                {Array.from({ length: 5 }).map((_, si) => (
                                    <Star key={si} size={16} fill={si < t.rating ? '#fed802' : 'transparent'} color={si < t.rating ? '#fed802' : '#333'} />
                                ))}
                            </div>

                            <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.8, marginBottom: '24px' }}>&ldquo;{t.text}&rdquo;</p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(254,216,2,0.15), rgba(254,216,2,0.05))',
                                    border: '1px solid rgba(254,216,2,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fed802', fontWeight: 700, fontSize: '14px',
                                }}>
                                    {t.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{t.name}</div>
                                    <div style={{ color: '#555', fontSize: '12px' }}>{t.college}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
