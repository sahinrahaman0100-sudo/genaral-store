import React from 'react';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', label = 'Loading…' }) => (
  <div className={styles.wrapper} role="status" aria-label={label}>
    <div className={`${styles.ring} ${styles[size]}`} />
    {label && <span className={styles.label}>{label}</span>}
  </div>
);

export const PageSpinner: React.FC<{ label?: string }> = ({ label }) => (
  <div className={styles.page}>
    <Spinner size="lg" label={label} />
  </div>
);
