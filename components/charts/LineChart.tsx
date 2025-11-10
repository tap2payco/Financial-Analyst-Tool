import React, { useRef, useEffect } from 'react';
import { LineChartData } from '../../types';

declare const Chart: any;

const lineColors = [
    { background: 'rgba(56, 189, 248, 0.2)', border: 'rgba(14, 165, 233, 1)' }, // Sky
    { background: 'rgba(16, 185, 129, 0.2)', border: 'rgba(5, 150, 105, 1)' },  // Emerald
    { background: 'rgba(249, 115, 22, 0.2)', border: 'rgba(234, 88, 12, 1)' }, // Orange
];

const LineChart: React.FC<{ data: LineChartData }> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: data.datasets.map((dataset, index) => ({
            ...dataset,
            fill: true,
            backgroundColor: lineColors[index % lineColors.length].background,
            borderColor: lineColors[index % lineColors.length].border,
            tension: 0.1
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
             labels: {
                 color: '#cbd5e1' // slate-300
             }
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#94a3b8' // slate-400
            },
            grid: {
                color: '#334155' // slate-700
            }
          },
          x: {
             ticks: {
              color: '#94a3b8' // slate-400
            },
             grid: {
                color: '#334155' // slate-700
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

export default LineChart;
