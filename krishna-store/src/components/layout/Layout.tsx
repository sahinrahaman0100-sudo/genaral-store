import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { CartDrawer } from './CartDrawer';
import { FloatingCartButton } from './FloatingCartButton';
import { PageSpinner } from '@/components/ui/Spinner';
import styles from './Layout.module.css';

export const Layout: React.FC = () => (
  <div className={styles.root}>
    <Header />
    <CartDrawer />
    <main className={styles.main}>
      <Suspense fallback={<PageSpinner />}>
        <Outlet />
      </Suspense>
    </main>
    <FloatingCartButton />
  </div>
);
