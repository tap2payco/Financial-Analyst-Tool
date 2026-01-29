import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are a SENIOR FINANCIAL ANALYST at Finance Guru, a premier AI-powered financial advisory firm. 

Your role is to analyze uploaded financial data and generate comprehensive, professional reports. You MUST:
1. Return a valid JSON object strictly adhering to the provided schema
2. Format 'reportText' in clear, well-structured markdown with proper headings
3. ALWAYS use markdown tables for presenting numerical data
4. ALWAYS provide chart data in the 'chartData' field - this is CRITICAL for visualization
5. Be precise with all numbers - calculate percentages, ratios, and totals accurately
6. Provide actionable, data-driven insights`;

const userInstructionTemplate = `Analyze the provided financial data and generate a comprehensive professional report.

## REQUIRED REPORT STRUCTURE:

### 1. Executive Summary
- Total Income, Total Expenses, Net Profit/Loss
- Profit Margin percentage
- Key financial health indicators

### 2. Expense Breakdown (MUST include markdown table)
| Category | Amount | % of Total |
|----------|--------|------------|
(Include top 5-7 expense categories)

### 3. Trend Analysis
- If multi-period data: compare periods with growth/decline percentages
- Highlight significant changes (>10% variance)

### 4. SWOT Analysis
| Strengths | Weaknesses |
|-----------|------------|
| Opportunities | Threats |

### 5. Risk Assessment
- Identify 2-3 key financial risks
- Provide mitigation strategies

### 6. Recommendations
- 2-3 specific, actionable recommendations based on the data

## CRITICAL - CHART DATA REQUIREMENTS:
You MUST provide chartData with:
- **expenseBreakdown**: labels (category names) + data (amounts) for BAR chart
- **expensePieChart**: same data formatted for PIE chart
- **trendAnalysis**: If multiple periods exist, provide labels (periods) and datasets array with {label, data} objects for LINE chart

NEVER omit chartData. If data seems limited, still provide at minimum expenseBreakdown and expensePieChart.

---
FINANCIAL DATA TO ANALYZE:
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        reportText: {
            type: Type.STRING,
            description: "The full financial report formatted in markdown."
        },
        chartData: {
            type: Type.OBJECT,
            description: "Data structured for generating charts.",
            nullable: true,
            properties: {
                expenseBreakdown: {
                    type: Type.OBJECT,
                    description: "Data for a bar chart showing expense categories.",
                    nullable: true,
                    properties: {
                        labels: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "The names of the expense categories."
                        },
                        data: {
                            type: Type.ARRAY,
                            items: { type: Type.NUMBER },
                            description: "The corresponding amount for each expense category."
                        }
                    }
                },
                expensePieChart: {
                    type: Type.OBJECT,
                    description: "Data for a pie chart showing expense proportions.",
                    nullable: true,
                    properties: {
                        labels: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "The names of the expense categories."
                        },
                        data: {
                            type: Type.ARRAY,
                            items: { type: Type.NUMBER },
                            description: "The corresponding amount for each expense category."
                        }
                    }
                },
                trendAnalysis: {
                    type: Type.OBJECT,
                    description: "Data for a line chart showing trends over time.",
                    nullable: true,
                    properties: {
                        labels: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "The time periods (e.g., months, years)."
                        },
                        datasets: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING, description: "The name of the data series (e.g., 'Revenue', 'Expenses')." },
                                    data: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "The data points for the series." }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    required: ['reportText']
};

import { rateLimitService } from './rateLimitService';
import { authService } from './authService';

export async function generateFinancialReport(fileContent: string): Promise<{ reportText: string; chartData?: any }> {
  // RATE LIMIT CHECK
  // In a real app, use the actual user ID or API key. 
  // For this client-side demo, we use a simple identifier or the user's ID if logged in.
  const user = await authService.getCurrentUserAsync();
  const identifier = user ? user.id : 'anonymous_user';
  
  const { success } = await rateLimitService.checkRateLimit(identifier);
  
  if (!success) {
      return { reportText: "⚠️ Rate limit exceeded. You are making too many requests. Please wait 10 seconds before trying again." };
  }

  try {
    const fullPrompt = `${userInstructionTemplate}\n\n${fileContent}`;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: fullPrompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.2,
            topP: 0.9,
            topK: 30,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        }
    });
    
    const text = response.text;
    const parsedJson = JSON.parse(text);

    // Basic validation
    if (!parsedJson.reportText) {
        throw new Error("AI response is missing the required 'reportText' field.");
    }
    
    return {
        reportText: parsedJson.reportText,
        chartData: parsedJson.chartData
    };

  } catch (error) {
    console.error("Error generating report:", error);
    if (error instanceof SyntaxError) {
        return { reportText: "Failed to generate report: The AI returned an invalid data format. Please try again." };
    }
    if (error instanceof Error) {
        return { reportText: `Failed to generate report due to an API error: ${error.message}` };
    }
    return { reportText: "An unknown error occurred while communicating with the AI service." };
  }
}

const chatSystemInstruction = `You are a PROFESSIONAL FINANCIAL ANALYST and consultant for Finance Guru, a premier financial advisory firm.

your name is Finance Guru.

DOMAIN RESTRICTION - You ONLY discuss:
- Financial analysis, reporting, budgeting
- Business finance, cash flow, P&L, balance sheets
- Investment analysis, tax planning, forecasting
- Risk assessment, accounting practices

If the user asks about anything else (coding, politics, general knowledge, etc.), politely decline: "I specialize in financial analysis. How can I help with your finance needs today?"

TONE & STYLE:
- Professional, objective, and precise.
- Use financial terminology correctly (EBITDA, ROI, Liquidity, etc.).
- Be concise but thorough.
- Suggest uploading files (Excel, CSV, PDF) if the user mentions data.

IMPORTANT:
- If the user greets you, welcome them to Finance Guru.
- If they ask who you are, say you are the Finance Guru AI Analyst.
- Remember: You represent Finance Guru's expertise. Maintain credibility by staying strictly within your financial expertise domain.`;

export async function sendChatMessage(history: { role: 'user' | 'model', parts: { text: string }[] }[], newMessage: string): Promise<string> {
    try {
         const contents = [
             ...history,
             { role: 'user', parts: [{ text: newMessage }] }
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: chatSystemInstruction,
                maxOutputTokens: 500,
            },
            contents: contents as any // Casting to avoid strict type mismatch if any, though structure matches
        });

        return response.text || "";
    } catch (error) {
        console.error("Error sending chat message:", error);
        return "I apologize, but I'm having trouble connecting right now. Please try again later.";
    }
}