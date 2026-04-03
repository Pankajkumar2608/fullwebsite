'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Bell, CalendarDays, FileText } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

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
    return (
        <section id="resources" className="py-24 sm:py-32 relative overflow-visible bg-black w-full">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="w-full max-w-3xl mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
                <div className="text-center mb-16">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
                        Resources & <span className="text-[#fed802]">FAQs</span>
                    </motion.h2>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="w-full bg-card/40 backdrop-blur-md rounded-2xl border border-white/5 p-2 sm:p-6 shadow-xl"
                >
                    <Accordion type="single" collapsible className="w-full flex flex-col gap-3">
                        {faqs.map((faq, i) => {
                            const Icon = faq.icon;
                            return (
                                <AccordionItem 
                                    key={faq.title} 
                                    value={`item-${i}`}
                                    className="border border-white/5 bg-background/50 rounded-xl px-2 sm:px-6 hover:border-white/10 transition-colors"
                                >
                                    <AccordionTrigger className="hover:no-underline py-5 text-left flex justify-between">
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="w-10 h-10 rounded-xl bg-[#fed802]/5 border border-[#fed802]/15 flex items-center justify-center shrink-0">
                                                <Icon size={18} className="text-[#fed802]" />
                                            </div>
                                            <span className="font-semibold text-base sm:text-lg text-foreground">{faq.title}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-6">
                                        <ul className="m-0 space-y-3 pl-14 pr-4">
                                            {faq.content.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#fed802]/40 mt-2 shrink-0" />
                                                    {item.href ? (
                                                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-[#fed802] hover:text-[#fde047] transition-colors inline-flex items-center gap-1.5">
                                                            {item.text} <ExternalLink size={12} />
                                                        </a>
                                                    ) : (
                                                        <span>{item.text}</span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    );
}
