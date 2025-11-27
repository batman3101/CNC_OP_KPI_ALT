'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: object[];
  xKey: string;
  yKeys: string[];
  labels: string[];
  colors: string[];
  horizontal?: boolean;
}

export default function BarChart({
  data,
  xKey,
  yKeys,
  labels,
  colors,
  horizontal = false,
}: BarChartProps) {
  const chartData = {
    labels: data.map((item) => (item as Record<string, unknown>)[xKey] as string),
    datasets: yKeys.map((key, index) => ({
      label: labels[index],
      data: data.map((item) => (item as Record<string, unknown>)[key] as number),
      backgroundColor: colors[index],
      borderRadius: 4,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? ('y' as const) : ('x' as const),
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#f0f0f0',
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
