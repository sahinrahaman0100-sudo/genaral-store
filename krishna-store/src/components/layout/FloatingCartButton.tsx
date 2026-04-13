import React from 'react';
import { useStore, useTotalItems } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import { formatPrice } from '@/utils/format';
import styles from './FloatingCartButton.module.css';

export const FloatingCartButton: React.FC = () => {
  const { t } = useTranslation();
  const totalItems = useTotalItems();
  const { setCartOpen, getTotal } = useStore();

  if (totalItems === 0) return null;

  return (
    <button
      className={styles.fab}
      onClick={() => setCartOpen(true)}
      aria-label={`View cart: ${totalItems} items`}
    >
      <span className={styles.left}>
        <span className={styles.badge}>{totalItems}</span>
        <span className={styles.label}>{t('cart')}</span>
      </span>
      <span className={styles.total}>{formatPrice(getTotal())}</span>
    </button>
  );
};
