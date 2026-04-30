import type { Metadata } from 'next';
import { Space_Grotesk, Inter, Outfit, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import { Dancing_Script } from "next/font/google";
import { ThemeProvider } from '@/components/ThemeProvider';
import { Providers } from '@/components/Providers';
import { CSPostHogProvider } from "./providers";

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-cursive",
  weight: ["500", "700"]
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
});

const barlowCondensed = Barlow_Condensed ( {
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'JEE College Predictor | JoSAA, CSAB, JAC Rank Analysis — Motivation Kaksha',
  description: 'Free JEE College Predictor! Get accurate JoSAA, CSAB & JAC Delhi, JAC Chandigarh college predictions based on your rank. Data-driven results to find your best engineering college fit.',
  keywords: 'JEE college predictor, JoSAA predictor, CSAB predictor, JAC Delhi predictor, JAC Chandigarh predictor, JEE rank analysis, engineering college predictor, college admission tool',
  openGraph: {
    title: 'Accurate JEE College Predictor — Motivation Kaksha',
    description: 'Free JEE College Predictor! Data-driven JoSAA, CSAB & JAC predictions.',
    url: 'https://motivationkaksha.com',
    siteName: 'Motivation Kaksha',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accurate JEE College Predictor — Motivation Kaksha',
    description: 'Data-driven college recommendations based on JEE ranks.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <CSPostHogProvider>
        <body
          className={`${barlowCondensed.variable} ${inter.variable} ${outfit.variable} ${dancing.variable} m-0 p-0`}
        >
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </Providers>
        </body>
      </CSPostHogProvider>
    </html>
  );
}
