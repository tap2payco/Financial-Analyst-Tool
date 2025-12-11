import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are a professional financial analysis assistant for Numbers Consulting. Your role is to analyze uploaded financial data and generate a detailed, insightful, and strategic report. This includes not just financial summaries but also a SWOT analysis and risk assessment. You must return a valid JSON object that strictly adheres to the provided schema. The 'reportText' field must be a markdown-formatted string. Use markdown tables to present tabular data for clarity. The 'chartData' field should contain data for visualizations if applicable.`;

const userInstructionTemplate = `Analyze the provided financial data. Generate a comprehensive report and extract data for charts.

The report should include:
- A summary with total income, expenses, net profit, and profit margin.
- A breakdown of the top 5-7 expense categories with amounts and percentages, presented in a markdown table.
- A comparative analysis in a markdown table if data from multiple periods is available.
- Key trends and observations.
- A SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) based on the financial data.
- A section on potential risks and mitigation strategies.
- 2-3 actionable recommendations.

Format the report text in clear markdown.

For chart data:
- **expenseBreakdown**: Provide labels (category names) and data (amounts) for a BAR chart of the top expenses.
- **expensePieChart**: Provide the same data for a PIE/DOUGHNUT chart. This is great for showing proportions.
- **trendAnalysis**: If data spans multiple periods, provide labels (e.g., months) and datasets (e.g., 'Income', 'Expenses') for a LINE chart.

If chart data is not applicable, you may omit the 'chartData' field or leave its properties empty.
---
Here is the data from the uploaded file:
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

export async function generateFinancialReport(fileContent: string): Promise<{ reportText: string; chartData?: any }> {
  try {
    const fullPrompt = `${userInstructionTemplate}\n\n${fileContent}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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

const chatSystemInstruction = `You are a helpful, professional, and friendly financial consultant assistant for Numbers Consulting. 
Your goal is to answer visitor questions about finance, business, and the services provided by Numbers Consulting.
Be concise and engaging. 
If asked about specific report generation, guide them to use the main 'Report Generator' tool on the website.`;

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