import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ============================================
// API DOCUMENTATION ENDPOINT
// ============================================
app.get('/api', (req, res) => {
    res.json({
        name: 'Numbers Consulting Financial Analysis API',
        version: '1.0.0',
        endpoints: {
            'POST /api/chat': {
                description: 'Send a message to the AI financial consultant',
                body: {
                    message: 'string (required) - The user message',
                    history: 'array (optional) - Chat history [{role: "user"|"model", content: "..."}]'
                },
                response: {
                    success: true,
                    reply: 'string - AI response'
                }
            },
            'POST /api/analyze': {
                description: 'Analyze financial data and generate a report',
                body: {
                    content: 'string (required) - CSV, text, or extracted file content',
                    type: 'string (optional) - "csv", "text", or "json"'
                },
                response: {
                    success: true,
                    report: 'string - Markdown formatted report',
                    chartData: 'object - Data for visualizations'
                }
            },
            'POST /api/generate-pdf': {
                description: 'Generate a branded PDF from HTML content',
                body: {
                    html: 'string (required) - HTML/Markdown content for PDF',
                    title: 'string (optional) - Report title'
                },
                response: 'application/pdf - PDF file download'
            },
            'GET /health': {
                description: 'Health check endpoint',
                response: { status: 'ok', timestamp: 'ISO date' }
            }
        },
        authentication: 'API Key required (contact Numbers Consulting)',
        rateLimit: '100 requests per minute'
    });
});

// ============================================
// CHAT API ENDPOINT
// ============================================
const chatSystemInstruction = `You are a PROFESSIONAL FINANCIAL ANALYST for Numbers Consulting.

DOMAIN RESTRICTION - You ONLY discuss:
- Financial analysis, reporting, budgeting
- Business finance, cash flow, P&L, balance sheets
- Investment analysis, tax planning, forecasting
- Risk assessment, accounting practices

For off-topic questions, respond: "I specialize in financial analysis. How can I help with your finance needs?"

Be professional, precise, and data-driven. Use proper financial terminology.`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }

        // Build chat contents
        const contents = [
            ...history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }]
            })),
            { role: 'user', parts: [{ text: message }] }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: chatSystemInstruction,
                maxOutputTokens: 1000
            },
            contents
        });

        res.json({
            success: true,
            reply: response.text || ''
        });
    } catch (error) {
        console.error('Chat API error:', error);
        res.status(500).json({ success: false, error: 'Failed to process chat message' });
    }
});

// ============================================
// FINANCIAL ANALYSIS API ENDPOINT
// ============================================
const analysisSystemInstruction = `You are a senior financial analyst at Numbers Consulting.

Analyze the provided financial data and generate a comprehensive report including:
1. Executive Summary
2. Key Financial Metrics (revenue, expenses, profit margins, ratios)
3. Trend Analysis
4. Risk Assessment
5. Recommendations

Format your response in clear Markdown. Be thorough, professional, and data-driven.
Also provide chartData as JSON for visualization.`;

app.post('/api/analyze', async (req, res) => {
    try {
        const { content, type = 'text' } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, error: 'Content is required' });
        }

        const prompt = `Analyze this ${type} financial data and provide a detailed report:\n\n${content}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: analysisSystemInstruction,
                maxOutputTokens: 4000,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'object',
                    properties: {
                        reportText: { type: 'string', description: 'Full report in Markdown' },
                        chartData: {
                            type: 'object',
                            nullable: true,
                            properties: {
                                expenseBreakdown: {
                                    type: 'object',
                                    properties: {
                                        labels: { type: 'array', items: { type: 'string' } },
                                        values: { type: 'array', items: { type: 'number' } }
                                    }
                                },
                                trendAnalysis: {
                                    type: 'object',
                                    properties: {
                                        labels: { type: 'array', items: { type: 'string' } },
                                        values: { type: 'array', items: { type: 'number' } }
                                    }
                                }
                            }
                        }
                    },
                    required: ['reportText']
                }
            },
            contents: prompt
        });

        const parsed = JSON.parse(response.text);

        res.json({
            success: true,
            report: parsed.reportText,
            chartData: parsed.chartData || null
        });
    } catch (error) {
        console.error('Analysis API error:', error);
        res.status(500).json({ success: false, error: 'Failed to analyze financial data' });
    }
});

// ============================================
// PDF GENERATION (existing code)
// ============================================
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

function wrapWithWatermark(html, title = 'Financial Report') {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title} - Numbers Consulting</title>
    <style>
        * { -webkit-user-select: none !important; user-select: none !important; }
        @page { margin: 20mm; }
        body { font-family: 'Segoe UI', sans-serif; color: #1e293b; line-height: 1.6; padding: 20px; }
        body::before {
            content: 'NUMBERS CONSULTING';
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px; font-weight: bold; color: rgba(14, 165, 233, 0.08);
            pointer-events: none; z-index: 1000;
        }
        .report-header { display: flex; justify-content: space-between; border-bottom: 3px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { width: 50px; height: 50px; background: linear-gradient(135deg, #0ea5e9, #6366f1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; }
        h1, h2, h3 { color: #0f172a; } h2 { color: #0ea5e9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #e2e8f0; padding: 12px; }
        th { background: #f1f5f9; }
        .report-footer { margin-top: 40px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px; padding-top: 20px; }
        .confidential { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px; margin-top: 20px; font-size: 11px; color: #92400e; }
    </style>
</head>
<body>
    <div class="report-header">
        <div style="display:flex;align-items:center;gap:15px;">
            <div class="logo">NC</div>
            <div><div style="font-size:24px;font-weight:bold;">Numbers Consulting</div><div style="font-size:12px;color:#64748b;">Professional Financial Analysis</div></div>
        </div>
        <div style="color:#64748b;font-size:12px;">Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
    <div>${html}</div>
    <div class="report-footer">
        <div class="confidential">⚠️ CONFIDENTIAL: Property of Numbers Consulting. Unauthorized use prohibited.</div>
        <p>© ${new Date().getFullYear()} Numbers Consulting. All rights reserved.</p>
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
        const wrappedHtml = wrapWithWatermark(html, title);
        await page.setContent(wrappedHtml, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: '<div style="width:100%;font-size:9px;color:#94a3b8;text-align:center;padding:10px;">Numbers Consulting - Confidential <span style="float:right;">Page <span class="pageNumber"></span>/<span class="totalPages"></span></span></div>',
            margin: { top: '20mm', right: '20mm', bottom: '25mm', left: '20mm' }
        });

        res.contentType('application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Numbers_Report_${Date.now()}.pdf"`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║  Numbers Consulting API Server                             ║
║  Running on: http://localhost:${PORT}                         ║
║                                                            ║
║  Endpoints:                                                ║
║    GET  /api           - API Documentation                 ║
║    POST /api/chat      - Chat with AI                      ║
║    POST /api/analyze   - Analyze financial data            ║
║    POST /api/generate-pdf - Generate branded PDF           ║
║    GET  /health        - Health check                      ║
╚════════════════════════════════════════════════════════════╝
    `);
});
