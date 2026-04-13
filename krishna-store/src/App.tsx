import React, { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ToastProvider } from '@/components/ui/Toast';

// Lazy-loaded pages
const Home          = lazy(() => import('@/pages/Home'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Checkout      = lazy(() => import('@/pages/Checkout'));
const OtpVerify     = lazy(() => import('@/pages/OtpVerify'));
const OrderTracking = lazy(() => import('@/pages/OrderTracking'));
const NotFound      = lazy(() => import('@/pages/NotFound'));

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index              element={<Home />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="checkout"    element={<Checkout />} />
            <Route path="verify/:orderRef" element={<OtpVerify />} />
            <Route path="track"       element={<OrderTracking />} />
            <Route path="track/:orderRef" element={<OrderTracking />} />
            <Route path="*"           element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
