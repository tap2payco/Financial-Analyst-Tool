import React, { useRef, useEffect } from 'react';
import { BarChartData } from '../../types';

declare const Chart: any;

const BarChart: React.FC<{ data: BarChartData }> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Amount',
          data: data.data,
          backgroundColor: 'rgba(56, 189, 248, 0.6)', // sky-400 with opacity
          borderColor: 'rgba(14, 165, 233, 1)', // sky-500
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
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
                display: false
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

export default BarChart;