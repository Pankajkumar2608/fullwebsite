import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
        <section className="py-24 sm:py-32 relative overflow-visible bg-black/50 w-full border-t border-border/10">
            {/* Divider with glow dot */}
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#fed802] shadow-[0_0_10px_rgba(254,216,2,1)]" />
            </div>
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10 overflow-visible">
                <div className="text-center mb-16">
                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <Badge variant="outline" className="px-5 py-2 rounded-full border-[#fed802]/10 text-[#fed802] tracking-widest uppercase mb-7 bg-[#fed802]/5">
                            ⭐ Student Reviews
                        </Badge>
                    </motion.div>
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
                        What Students <span className="text-[#fed802]">Say</span>
                    </motion.h2>
                </div>

                {/* Testimonial Grid wrapper for horizontal mobile scroll */}
                <div className="flex overflow-x-auto snap-x snap-mandatory lg:grid lg:grid-cols-3 gap-6 pb-8 -mx-6 px-6 lg:mx-0 lg:px-0 lg:pb-0 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
                    {testimonials.map((t, i) => {
                        const MotionCard = motion.create(Card);
                        const isEven = i % 2 === 0;
                        return (
                            <MotionCard
                                key={t.name}
                                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.5, delay: i * 0.1, type: "spring", stiffness: 80 }}
                                className={`w-[85vw] shrink-0 snap-center lg:w-auto bg-card/40 backdrop-blur-sm border-white/5 rounded-2xl relative transition-all duration-500 hover:border-white/10 hover:-translate-y-2 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.9)] group overflow-hidden ${i % 2 !== 0 ? 'lg:mt-8' : ''}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                <Quote size={32} className="absolute top-6 right-6 text-white/5" />

                                <CardContent className="p-8">
                                    {/* Stars */}
                                    <div className="flex gap-1 mb-5 relative z-10">
                                        {Array.from({ length: 5 }).map((_, si) => (
                                            <Star key={si} size={16} fill={si < t.rating ? '#fed802' : 'transparent'} className={si < t.rating ? 'text-[#fed802]' : 'text-zinc-700'} />
                                        ))}
                                    </div>

                                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 relative z-10 min-h-[60px]">&ldquo;{t.text}&rdquo;</p>

                                    <div className="flex items-center gap-3 relative z-10 mt-auto">
                                        <Avatar className="w-10 h-10 border border-[#fed802]/20">
                                            <AvatarFallback className="bg-gradient-to-br from-[#fed802]/20 to-[#fed802]/5 text-[#fed802] font-bold text-xs">
                                                {t.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="text-foreground font-semibold text-sm tracking-tight">{t.name}</div>
                                            <div className="text-muted-foreground text-xs">{t.college}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </MotionCard>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
