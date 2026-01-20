import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer-core';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Find Chrome executable path
function getChromePath() {
    const paths = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    ];
    
    for (const path of paths) {
        try {
            require('fs').accessSync(path);
            return path;
        } catch {}
    }
    return null;
}

app.post('/api/generate-pdf', async (req, res) => {
    const { html, options = {} } = req.body;

    if (!html) {
        return res.status(400).json({ error: 'HTML content is required' });
    }

    let browser = null;
    try {
        const chromePath = getChromePath();
        
        browser = await puppeteer.launch({
            executablePath: chromePath,
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
            ...options
        });

        res.contentType('application/pdf');
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`PDF Server running on http://localhost:${PORT}`);
});
