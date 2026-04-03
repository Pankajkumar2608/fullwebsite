'use client';

export function Footer() {
    return (
        <footer className="bg-black pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse,rgba(254,216,2,0.04)_0%,transparent_70%)] pointer-events-none" />

            {/* Massive Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full overflow-hidden flex justify-center pointer-events-none select-none z-0">
                <span className="text-[80px] sm:text-[120px] md:text-[160px] font-black text-white whitespace-nowrap opacity-[0.03] tracking-tighter">
                    MOTIVATION KAKSHA
                </span>
            </div>

            <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
                {/* Logo */}
                <img
                    src="/motivation kaksha logo.png"
                    alt="Motivation Kaksha"
                    className="h-9 w-auto mx-auto mb-8"
                />

                {/* Links */}
                <div className="flex justify-center gap-8 flex-wrap mb-8">
                    {['Privacy Policy', 'Terms of Service', 'Contact Support'].map((link) => (
                        <a key={link} href="#" className="text-[#555] no-underline text-[14px] font-medium transition-colors duration-300 hover:text-[#fed802]">
                            {link}
                        </a>
                    ))}
                </div>

                {/* Social icons */}
                <div className="flex justify-center gap-5 mb-10">
                    {[
                        { label: 'Telegram', href: 'https://t.me/Motivation_kaksha', svg: 'M21.198 2.394a1.403 1.403 0 0 0-1.453-.207L2.65 9.892a1.404 1.404 0 0 0 .13 2.613l4.327 1.29 1.627 5.199a1.401 1.401 0 0 0 2.27.55l2.52-2.298 4.33 3.298a1.403 1.403 0 0 0 2.2-.76L22.394 3.9a1.403 1.403 0 0 0-1.196-1.506z' },
                        { label: 'YouTube', href: '#', svg: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                    ].map((social) => (
                        <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"
                            className="group w-10 h-10 rounded-[12px] bg-white/5 border border-white/5 flex items-center justify-center transition-all duration-300 hover:border-[#fed802]/30 hover:bg-[#fed802]/5 hover:scale-110 hover:rotate-12"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-[#888] group-hover:text-[#fed802] transition-colors"><path d={social.svg} /></svg>
                        </a>
                    ))}
                </div>

                {/* Copyright */}
                <p className="text-[#333] text-[13px] font-medium tracking-[1px] uppercase">
                    © {new Date().getFullYear()} MOTIVATION KAKSHA. ALL RIGHTS RESERVED.
                </p>
            </div>
        </footer>
    );
}
