import React from 'react';
import styles from './QuantityStepper.module.css';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  size = 'md',
}) => (
  <div className={`${styles.stepper} ${styles[size]}`}>
    <button
      className={styles.btn}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDecrement(); }}
      disabled={quantity <= min}
      aria-label="Decrease quantity"
    >
      −
    </button>
    <span className={styles.count}>{quantity}</span>
    <button
      className={styles.btn}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); onIncrement(); }}
      disabled={quantity >= max}
      aria-label="Increase quantity"
    >
      +
    </button>
  </div>
);
