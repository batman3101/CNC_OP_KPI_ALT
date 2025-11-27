'use client';

import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface GaugeChartProps {
  value: number;
  target: number;
  title: string;
  maxValue?: number;
}

export default function GaugeChart({
  value,
  target,
  title,
  maxValue = 120,
}: GaugeChartProps) {
  const normalizedValue = Math.min(value, maxValue);
  const remaining = maxValue - normalizedValue;

  const getColor = () => {
    if (value >= target) return '#52c41a';
    if (value >= target - 5) return '#faad14';
    return '#ff4d4f';
  };

  const data = {
    datasets: [
      {
        data: [normalizedValue, remaining],
        backgroundColor: [getColor(), '#f0f0f0'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
        cutout: '75%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className="relative" style={{ height: '200px' }}>
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
        <span className="text-3xl font-bold" style={{ color: getColor() }}>
          {value.toFixed(1)}%
        </span>
        <span className="text-gray-500 text-sm">{title}</span>
        <span className="text-gray-400 text-xs">목표: {target}%</span>
      </div>
    </div>
  );
}
