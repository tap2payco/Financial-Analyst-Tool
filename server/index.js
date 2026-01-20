import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer-core';
import fs from 'fs';

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
            fs.accessSync(path);
            return path;
        } catch {}
    }
    return null;
}

// Wrap HTML with watermark and protection styles
function wrapWithWatermark(html, title = 'Financial Report') {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title} - Numbers Consulting</title>
    <style>
        * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }
        
        @page {
            margin: 20mm;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1e293b;
            line-height: 1.6;
            position: relative;
            padding: 20px;
        }
        
        /* Watermark */
        body::before {
            content: 'NUMBERS CONSULTING';
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            font-weight: bold;
            color: rgba(14, 165, 233, 0.08);
            white-space: nowrap;
            pointer-events: none;
            z-index: 1000;
        }
        
        /* Header */
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #0ea5e9;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #0ea5e9, #6366f1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #0f172a;
        }
        
        .company-tagline {
            font-size: 12px;
            color: #64748b;
        }
        
        .report-date {
            text-align: right;
            color: #64748b;
            font-size: 12px;
        }
        
        /* Content styling */
        .report-content {
            position: relative;
            z-index: 1;
        }
        
        h1, h2, h3, h4 {
            color: #0f172a;
            margin-top: 1.5em;
        }
        
        h1 { font-size: 28px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        h2 { font-size: 22px; color: #0ea5e9; }
        h3 { font-size: 18px; }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th, td {
            border: 1px solid #e2e8f0;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background: #f1f5f9;
            font-weight: 600;
            color: #0f172a;
        }
        
        tr:nth-child(even) {
            background: #f8fafc;
        }
        
        /* Footer */
        .report-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #94a3b8;
            font-size: 11px;
        }
        
        .confidential-notice {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 12px;
            margin-top: 20px;
            font-size: 11px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="report-header">
        <div class="logo-section">
            <div class="logo">NC</div>
            <div>
                <div class="company-name">Numbers Consulting</div>
                <div class="company-tagline">Professional Financial Analysis</div>
            </div>
        </div>
        <div class="report-date">
            Generated: ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })}
        </div>
    </div>
    
    <div class="report-content">
        ${html}
    </div>
    
    <div class="report-footer">
        <div class="confidential-notice">
            ⚠️ CONFIDENTIAL: This document is the property of Numbers Consulting and the intended recipient. 
            Unauthorized copying, distribution, or use of this document is strictly prohibited.
        </div>
        <p style="margin-top: 15px;">
            © ${new Date().getFullYear()} Numbers Consulting. All rights reserved.<br>
            This report was generated using AI-powered financial analysis.
        </p>
    </div>
</body>
</html>`;
}

app.post('/api/generate-pdf', async (req, res) => {
    const { html, title = 'Financial Report' } = req.body;

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
        
        // Set content with watermark wrapper
        const wrappedHtml = wrapWithWatermark(html, title);
        await page.setContent(wrappedHtml, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: `
                <div style="width: 100%; font-size: 9px; color: #94a3b8; text-align: center; padding: 10px 20px;">
                    <span>Numbers Consulting - Confidential</span>
                    <span style="float: right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                </div>
            `,
            margin: { top: '20mm', right: '20mm', bottom: '25mm', left: '20mm' }
        });

        res.contentType('application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Numbers_Consulting_Report_${Date.now()}.pdf"`);
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
