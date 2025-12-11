import React, { useState, useEffect, useMemo } from 'react';
import LineChart from './charts/LineChart';
import { LineChartData } from '../types';

const Simulator: React.FC = () => {
  const [initialRevenue, setInitialRevenue] = useState<number>(100000);
  const [growthRate, setGrowthRate] = useState<number>(5);
  const [expenses, setExpenses] = useState<number>(50000);
  const [years, setYears] = useState<number>(5);

  const { chartData, projection } = useMemo(() => {
    const labels: string[] = [];
    const revenueData: number[] = [];
    const expenseData: number[] = [];
    const profitData: number[] = [];

    let currentRevenue = initialRevenue;
    let currentExpenses = expenses;

    // Monthly projection for smoother graph? No, let's do Yearly for simplicity first, or Monthly if requested.
    // The plan said "calculate monthly projections" but usually for 5 years annual is better.
    // Let's do Annual points but maybe labeled by Year.
    
    for (let i = 0; i <= years; i++) {
        labels.push(`Year ${i}`);
        revenueData.push(currentRevenue);
        expenseData.push(currentExpenses);
        profitData.push(currentRevenue - currentExpenses);

        // Compounding growth
        currentRevenue = currentRevenue * (1 + growthRate / 100);
        // Assuming expenses grow at fixed inflation or same rate? Let's keep expenses fixed for simplicity or give it an inflation rate?
        // Let's keep expenses fixed for now as per "expenses" input, but usually they grow. 
        // Let's simplify: simple fixed expenses.
    }

    const data: LineChartData = {
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueData,
        },
        {
          label: 'Expenses',
          data: expenseData,
        },
        {
          label: 'Net Profit',
          data: profitData,
        }
      ]
    };

    return { 
        chartData: data, 
        projection: {
            finalRevenue: revenueData[revenueData.length - 1],
            totalProfit: profitData.reduce((a, b) => a + b, 0)
        }
    };
  }, [initialRevenue, growthRate, expenses, years]);

  return (
    <div className="flex flex-col gap-6 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2">
            <label htmlFor="initialRevenue" className="text-sm font-medium text-slate-700 dark:text-slate-300">Initial Revenue ($)</label>
            <input 
                id="initialRevenue"
                type="number" 
                value={initialRevenue} 
                onChange={(e) => setInitialRevenue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
        </div>
        <div className="flex flex-col gap-2">
            <label htmlFor="growthRate" className="text-sm font-medium text-slate-700 dark:text-slate-300">Growth Rate (%)</label>
            <input 
                id="growthRate"
                type="number" 
                value={growthRate} 
                onChange={(e) => setGrowthRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
        </div>
        <div className="flex flex-col gap-2">
             <label htmlFor="expenses" className="text-sm font-medium text-slate-700 dark:text-slate-300">Annual Expenses ($)</label>
            <input 
                id="expenses"
                type="number" 
                value={expenses} 
                onChange={(e) => setExpenses(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
        </div>
        <div className="flex flex-col gap-2">
             <label htmlFor="years" className="text-sm font-medium text-slate-700 dark:text-slate-300">Projection Years</label>
             <input 
                id="years"
                type="range" 
                min="1" 
                max="20" 
                value={years} 
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-sky-500"
            />
            <span className="text-xs text-slate-500 text-right">{years} Years</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
              <h3 className="text-sm font-medium text-sky-800 dark:text-sky-300">Projected Final Revenue</h3>
              <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(projection.finalRevenue)}
              </p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
              <h3 className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Total Cumulative Profit</h3>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(projection.totalProfit)}
              </p>
          </div>
      </div>

      <div className="h-96 w-full">
        <LineChart data={chartData} />
      </div>
    </div>
  );
};

export default Simulator;
