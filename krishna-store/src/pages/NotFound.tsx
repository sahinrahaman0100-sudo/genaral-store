import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import styles from './NotFound.module.css';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <span className={styles.emoji}>🔍</span>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Page not found</h2>
        <p className={styles.desc}>The page you're looking for doesn't exist or has been moved.</p>
        <Button variant="primary" size="lg" onClick={() => navigate('/')}>
          Back to Store
        </Button>
      </div>
    </div>
  );
}
