import React from 'react';
import styles from './StatCard.module.css';

interface Trend {
  value: number;
  isPositive: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  iconClass: string;
  trend?: Trend;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, iconClass, trend }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h4 className={styles.title}>{title}</h4>
        <div className={styles.iconWrapper}>
          <i className={iconClass}></i>
        </div>
      </div>
      <div className={styles.body}>
        <span className={styles.value}>{value}</span>
        {trend && (
          <div className={`${styles.trend} ${trend.isPositive ? styles.positive : styles.negative}`}>
            <i className={trend.isPositive ? 'fa-solid fa-arrow-trend-up' : 'fa-solid fa-arrow-trend-down'}></i>
            <span>{Math.abs(trend.value)}% from last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
