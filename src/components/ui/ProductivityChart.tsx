import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

import type { ProductivityDataPoint } from '../../services/dashboardService';
import styles from './ProductivityChart.module.css';

// Custom tooltip declared outside of the main component to prevent re-creation on every render
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // We assume the first payload item is learning_hours and the second is progress_percentage
  const learningHours = payload[0]?.value ?? 0;
  const progress = payload[1]?.value ?? 0;

  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>{label}</p>
      <p className={styles.tooltipHours}>
        {learningHours.toFixed(2)}h learning
      </p>
      <p className={styles.tooltipProgress}>
        {progress.toFixed(1)}% progress
      </p>
    </div>
  );
};

interface ProductivityChartProps {
  data: ProductivityDataPoint[];
  title?: string;
  isLoading?: boolean;
}

const ProductivityChart: React.FC<ProductivityChartProps> = ({
  data,
  title = 'Working Productivity',
  isLoading = false,
}) => {
  // Transform data for the chart - show last 14 days for better visibility
  const chartData = data.slice(-14).map((point) => ({
    ...point,
    // Format date as short format (e.g., "Apr 15")
    shortDate: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.chartArea}>
          <div className={styles.loading}>
            <span className={styles.spinner}></span>
            <p>Loading productivity data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.chartArea}>
          <div className={styles.empty}>
            <i className="fa-solid fa-chart-line" />
            <p>No productivity data yet. Start learning to see your progress!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.period}>Last 14 days</span>
      </div>
      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="shortDate"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'Hours',
                angle: -90,
                position: 'insideLeft',
                fontSize: 10,
                fill: '#64748b',
              }}
              domain={[0, 'auto']}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              label={{
                value: 'Progress %',
                angle: 90,
                position: 'insideRight',
                fontSize: 10,
                fill: '#64748b',
              }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="learning_hours"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHours)"
              name="Learning Hours"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="progress_percentage"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorProgress)"
              name="Progress"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductivityChart;