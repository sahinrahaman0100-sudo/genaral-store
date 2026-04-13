import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/utils/format';
import styles from './CartDrawer.module.css';

export const CartDrawer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    items,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeItem,
    getSubtotal,
    getDeliveryCharge,
    getTotal,
    deliveryMode,
  } = useStore();

  const subtotal = getSubtotal();
  const deliveryCharge = getDeliveryCharge();
  const total = getTotal();

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div
        className={styles.overlay}
        onClick={() => setCartOpen(false)}
        aria-hidden
      />
      <aside className={styles.drawer} role="dialog" aria-label="Shopping cart">
        <div className={styles.header}>
          <h2 className={styles.title}>{t('yourCart')}</h2>
          <button
            className={styles.closeBtn}
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🛒</span>
            <p className={styles.emptyTitle}>{t('emptyCart')}</p>
            <p className={styles.emptyHint}>{t('emptyCartHint')}</p>
          </div>
        ) : (
          <>
            <ul className={styles.items}>
              {items.map((item) => (
                <li key={item.id} className={styles.item}>
                  <span className={styles.emoji}>{item.emoji}</span>
                  <div className={styles.info}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.price}>{formatPrice(item.price)}</span>
                  </div>
                  <div className={styles.controls}>
                    <QuantityStepper
                      quantity={item.quantity}
                      onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                      onDecrement={() =>
                        item.quantity === 1
                          ? removeItem(item.id)
                          : updateQuantity(item.id, item.quantity - 1)
                      }
                      size="sm"
                    />
                    <span className={styles.lineTotal}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.summary}>
              <div className={styles.row}>
                <span>{t('subtotal')}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className={styles.row}>
                <span>{t('deliveryCharge')}</span>
                <span className={deliveryCharge === 0 ? styles.free : ''}>
                  {deliveryCharge === 0 ? t('free') : formatPrice(deliveryCharge)}
                </span>
              </div>
              {deliveryMode === 'delivery' && (
                <p className={styles.deliveryNote}>₹40 flat · Free on self-pickup</p>
              )}
              <div className={`${styles.row} ${styles.totalRow}`}>
                <span>{t('total')}</span>
                <span className={styles.totalAmount}>{formatPrice(total)}</span>
              </div>
            </div>

            <div className={styles.footer}>
              <Button variant="primary" fullWidth size="lg" onClick={handleCheckout}>
                {t('proceedToCheckout')} →
              </Button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};
