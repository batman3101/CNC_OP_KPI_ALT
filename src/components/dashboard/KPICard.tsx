'use client';

import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface KPICardProps {
  title: string;
  value: number;
  suffix?: string;
  precision?: number;
  status?: 'success' | 'warning' | 'error';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function KPICard({
  title,
  value,
  suffix,
  precision = 0,
  status,
  trend,
}: KPICardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'error':
        return '#ff4d4f';
      default:
        return '#000080';
    }
  };

  return (
    <Card className="h-full">
      <Statistic
        title={<span className="text-gray-600">{title}</span>}
        value={value}
        precision={precision}
        suffix={suffix}
        valueStyle={{ color: getStatusColor(), fontWeight: 'bold' }}
        prefix={
          trend ? (
            trend.isPositive ? (
              <ArrowUpOutlined className="text-green-500" />
            ) : (
              <ArrowDownOutlined className="text-red-500" />
            )
          ) : null
        }
      />
      {trend && (
        <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
        </p>
      )}
    </Card>
  );
}
