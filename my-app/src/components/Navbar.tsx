'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '#predictors', label: 'Predictors' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#resources', label: 'Resources' },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav style={{
            position: 'fixed', width: '100%', top: 0, zIndex: 100,
            transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
            background: scrolled ? 'rgba(0,0,0,0.92)' : 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(24px) saturate(180%)',
            borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
        }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '76px' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', transition: 'transform 0.3s' }}>
                    <img src="/motivation kaksha logo.png" alt="Motivation Kaksha" style={{ height: '38px', width: 'auto' }} />
                </Link>

                {/* Desktop */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }} className="nav-desktop">
                    {navLinks.map((link) => (
                        <Link key={link.label} href={link.href}
                            className="font-display"
                            style={{ color: '#999', textDecoration: 'none', fontSize: '14px', fontWeight: 500, letterSpacing: '0.5px', transition: 'color 0.3s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#999'; }}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link href="https://ai.motivationkaksha.xyz/login"
                        className="font-display"
                        style={{
                            background: 'linear-gradient(135deg, #fed802, #fde047)', color: '#000',
                            padding: '10px 28px', borderRadius: '999px', fontWeight: 700, fontSize: '13px',
                            textTransform: 'uppercase', letterSpacing: '1.5px', textDecoration: 'none',
                            transition: 'all 0.3s', boxShadow: '0 0 20px rgba(254,216,2,0.15)',
                        }}
                    >
                        Sign Up
                    </Link>
                </div>

                {/* Mobile */}
                <button onClick={() => setIsOpen(!isOpen)} className="nav-mobile-toggle"
                    style={{ display: 'none', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '8px' }}>
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: 'hidden', background: 'rgba(0,0,0,0.97)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ padding: '16px 24px 28px' }}>
                            {navLinks.map((link) => (
                                <Link key={link.label} href={link.href} onClick={() => setIsOpen(false)}
                                    style={{ display: 'block', padding: '14px 0', color: '#bbb', textDecoration: 'none', fontSize: '15px', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    {link.label}
                                </Link>
                            ))}
                            <Link href="https://ai.motivationkaksha.xyz/login" onClick={() => setIsOpen(false)}
                                style={{ display: 'block', marginTop: '16px', color: '#fed802', textDecoration: 'none', fontSize: '15px', fontWeight: 700 }}>
                                Sign Up →
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: flex !important; }
        }
      `}</style>
        </nav>
    );
}
