import React, { useRef, useEffect } from 'react';
import { BarChartData } from '../../types'; // Re-use BarChartData type

declare const Chart: any;

const pieColors = [
  'rgba(14, 165, 233, 0.8)',   // sky-500
  'rgba(16, 185, 129, 0.8)',   // emerald-500
  'rgba(249, 115, 22, 0.8)',    // orange-500
  'rgba(139, 92, 246, 0.8)',   // violet-500
  'rgba(236, 72, 153, 0.8)',   // pink-500
  'rgba(245, 158, 11, 0.8)',    // amber-500
  'rgba(99, 102, 241, 0.8)',    // indigo-500
];

const PieChart: React.FC<{ data: BarChartData }> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.data,
          backgroundColor: pieColors,
          borderColor: '#1e293b', // slate-800, for separation
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#cbd5e1' // slate-300
            }
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed !== null) {
                  label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
                }
                return label;
              }
            }
          }
        }
      }
    });

    return () => {
      chart.destroy();
    };
  }, [data]);

  return <canvas ref={chartRef} />;
};

export default PieChart;
