import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET() {
  try {
    const response = await fetch('https://jeemain.nta.nic.in/', { 
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch from NTA');
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const notices: any[] = [];

    // Specifically target the exact list from the screenshot
    $('.vc_tta-panel-body .gen-list li a').each((i, el) => {
        // limit to 10 recent notices
        if (i >= 10) return;
        
        const $el = $(el);
        const title = $el.text().trim();
        let link = $el.attr('href');
        
        if (!link) return;
        
        // Handle relative links
        if (link.startsWith('/')) {
            link = `https://jeemain.nta.nic.in${link}`;
        }
        
        if (title) {
            notices.push({
                id: `nta-${i}`,
                board: 'JEE Main (NTA)',
                title: title,
                date: new Date().toISOString(), // Fallback if dates aren't easily parsed
                description: 'Latest Public Notice from NTA website.',
                url: link
            });
        }
    });

    return NextResponse.json({ success: true, count: notices.length, data: notices });
  } catch (error: any) {
    console.error('Scraping Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch live updates' }, { status: 500 });
  }
}
