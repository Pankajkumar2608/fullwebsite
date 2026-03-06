'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, ExternalLink, Bell, CalendarDays, FileText } from 'lucide-react';

const faqs = [
    {
        icon: Bell, title: 'Latest Updates',
        content: [
            { text: 'Check JoSAA Round 1 Result (Official Link)', href: 'https://josaa.admissions.nic.in/applicant/root/candidatelogin.aspx' },
            { text: 'Stay tuned for CSAB special round notifications.', href: null },
        ],
    },
    {
        icon: CalendarDays, title: 'Important Dates',
        content: [
            { text: 'Round 1 Fee Payment Deadline: Monday, 24 June 2024, 17:00 IST', href: null },
            { text: 'Round 2 Seat Allocation: Thursday, 27 June 2024, 17:00 IST', href: null },
        ],
    },
    {
        icon: FileText, title: 'Official Documents & Guides',
        content: [
            { text: 'JoSAA 2024 Schedule (Updated)', href: 'https://cdnbbsr.s3waas.gov.in/s313111c20aee51aeb480ecbd988cd8cc9/uploads/2024/06/2024061090.pdf' },
            { text: 'JoSAA 2024 Business Rules', href: 'https://cdnbbsr.s3waas.gov.in/s313111c20aee51aeb480ecbd988cd8cc9/uploads/2024/06/2024061078.pdf' },
            { text: 'CSAB Special Round Brochure 2024', href: 'https://cdnbbsr.s3waas.gov.in/s305a70454516ecd9194c293b0e415777f/uploads/2024/06/2024061187.pdf' },
            { text: 'JoSAA 2024 FAQ', href: 'https://cdnbbsr.s3waas.gov.in/s313111c20aee51aeb480ecbd988cd8cc9/uploads/2024/06/2024060897.pdf' },
        ],
    },
];

export function Resources() {
    const [openIdx, setOpenIdx] = useState<number | null>(null);

    return (
        <section id="resources" className="section" style={{ background: '#000' }}>
            <div className="divider" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="section-title font-display">
                        Resources & <span>FAQs</span>
                    </motion.h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {faqs.map((faq, i) => {
                        const Icon = faq.icon;
                        const isOpen = openIdx === i;
                        return (
                            <motion.div
                                key={faq.title}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                style={{
                                    borderRadius: '16px', background: '#0a0a0a',
                                    border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
                                }}
                            >
                                <button
                                    onClick={() => setOpenIdx(isOpen ? null : i)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer', color: '#fff',
                                        textAlign: 'left',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '12px',
                                            background: 'rgba(254,216,2,0.08)', border: '1px solid rgba(254,216,2,0.15)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            <Icon size={18} color="#fed802" />
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: '16px' }}>{faq.title}</span>
                                    </div>
                                    <ChevronDown
                                        size={20}
                                        color="#666"
                                        style={{ transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                                    />
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <ul style={{ padding: '0 24px 24px', margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {faq.content.map((item, idx) => (
                                                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#888', lineHeight: 1.6 }}>
                                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(254,216,2,0.4)', marginTop: '8px', flexShrink: 0 }} />
                                                        {item.href ? (
                                                            <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ color: '#fed802', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                                {item.text} <ExternalLink size={12} />
                                                            </a>
                                                        ) : (
                                                            <span>{item.text}</span>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
