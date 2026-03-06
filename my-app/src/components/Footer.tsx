'use client';

export function Footer() {
    return (
        <footer style={{
            background: '#000', padding: '80px 0 40px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Subtle glow */}
            <div style={{
                position: 'absolute', bottom: '-100px', left: '50%', transform: 'translateX(-50%)',
                width: '600px', height: '300px',
                background: 'radial-gradient(ellipse, rgba(254,216,2,0.04) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                {/* Logo */}
                <img
                    src="/motivation kaksha logo.png"
                    alt="Motivation Kaksha"
                    style={{ height: '36px', width: 'auto', margin: '0 auto 32px' }}
                />

                {/* Links */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '32px' }}>
                    {['Privacy Policy', 'Terms of Service', 'Contact Support'].map((link) => (
                        <a key={link} href="#" style={{ color: '#555', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 0.3s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#fed802'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; }}
                        >
                            {link}
                        </a>
                    ))}
                </div>

                {/* Social icons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px' }}>
                    {[
                        { label: 'Telegram', href: 'https://t.me/Motivation_kaksha', svg: 'M21.198 2.394a1.403 1.403 0 0 0-1.453-.207L2.65 9.892a1.404 1.404 0 0 0 .13 2.613l4.327 1.29 1.627 5.199a1.401 1.401 0 0 0 2.27.55l2.52-2.298 4.33 3.298a1.403 1.403 0 0 0 2.2-.76L22.394 3.9a1.403 1.403 0 0 0-1.196-1.506z' },
                        { label: 'YouTube', href: '#', svg: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                    ].map((social) => (
                        <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"
                            style={{
                                width: '40px', height: '40px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.3s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(254,216,2,0.3)';
                                e.currentTarget.style.background = 'rgba(254,216,2,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#888"><path d={social.svg} /></svg>
                        </a>
                    ))}
                </div>

                {/* Copyright */}
                <p style={{ color: '#333', fontSize: '13px', fontWeight: 500, letterSpacing: '1px' }}>
                    © {new Date().getFullYear()} MOTIVATION KAKSHA. ALL RIGHTS RESERVED.
                </p>
            </div>
        </footer>
    );
}
