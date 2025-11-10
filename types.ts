export interface BarChartData {
  labels: string[];
  data: number[];
}

export interface LineChartDataset {
  label: string;
  data: number[];
}

export interface LineChartData {
  labels: string[];
  datasets: LineChartDataset[];
}

export interface ChartData {
  expenseBreakdown?: BarChartData;
  expensePieChart?: BarChartData;
  trendAnalysis?: LineChartData;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  content: string;
  chartData?: ChartData;
}