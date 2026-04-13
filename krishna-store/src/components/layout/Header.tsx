import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore, useTotalItems } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const totalItems = useTotalItems();
  const { toggleLanguage, language, setCartOpen } = useStore();

  return (
    <header className={styles.header}>
      <div className={`${styles.inner} page-container`}>
        <Link to="/" className={styles.brand}>
          <span className={styles.logo}>🛕</span>
          <div className={styles.brandText}>
            <span className={`${styles.storeName} ${language === 'hi' ? 'lang-hi' : ''}`}>
              {t('storeName')}
            </span>
            <span className={styles.tagline}>{t('tagline')}</span>
          </div>
        </Link>

        <nav className={styles.nav}>
          <Link to="/track" className={styles.navLink}>
            {t('track')}
          </Link>

          <button
            className={styles.langBtn}
            onClick={toggleLanguage}
            aria-label="Toggle language"
          >
            {t('language')}
          </button>

          <button
            className={styles.cartBtn}
            onClick={() => setCartOpen(true)}
            aria-label={`Cart with ${totalItems} items`}
          >
            <span className={styles.cartIcon}>🛒</span>
            {totalItems > 0 && (
              <span className={styles.badge}>{totalItems > 99 ? '99+' : totalItems}</span>
            )}
          </button>

          <button
            className={styles.checkoutBtn}
            onClick={() => navigate('/checkout')}
          >
            {t('checkout')}
          </button>
        </nav>
      </div>
    </header>
  );
};
