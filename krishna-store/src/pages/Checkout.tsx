import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import { placeOrder } from '@/utils/api';
import { formatPrice } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import type { CustomerDetails } from '@/types';
import styles from './Checkout.module.css';

const EMPTY_CUSTOMER: CustomerDetails = {
  name: '',
  email: '',
  phone: '',
  address: '',
  notes: '',
};

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    items,
    deliveryMode,
    setDeliveryMode,
    getSubtotal,
    getDeliveryCharge,
    getTotal,
    clearCart,
  } = useStore();

  const [customer, setCustomer] = useState<CustomerDetails>(EMPTY_CUSTOMER);
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({});
  const [loading, setLoading] = useState(false);

  const subtotal = getSubtotal();
  const deliveryCharge = getDeliveryCharge();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className={styles.emptyPage}>
        <span className={styles.emptyIcon}>🛒</span>
        <h2>{t('emptyCart')}</h2>
        <p>{t('emptyCartHint')}</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          {t('home')}
        </Button>
      </div>
    );
  }

  const validate = (): boolean => {
    const newErrors: Partial<CustomerDetails> = {};
    if (!customer.name.trim()) newErrors.name = t('required');
    if (!customer.phone.trim()) {
      newErrors.phone = t('required');
    } else if (!/^[6-9]\d{9}$/.test(customer.phone.trim())) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    }
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (deliveryMode === 'delivery' && !customer.address.trim()) {
      newErrors.address = t('required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof CustomerDetails) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCustomer((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast('Please fill in all required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const { orderRef } = await placeOrder({
        items,
        customer,
        deliveryMode,
        total,
        deliveryCharge,
      });
      clearCart();
      navigate(`/verify/${orderRef}`, {
        state: { phone: customer.phone, email: customer.email },
      });
    } catch {
      toast(t('error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className="page-container">
        <h1 className={styles.title}>{t('checkoutTitle')}</h1>

        <div className={styles.layout}>
          {/* Left col: form */}
          <div className={styles.formCol}>
            {/* Delivery mode toggle */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('deliveryMethod')}</h2>
              <div className={styles.modeToggle}>
                <button
                  className={`${styles.modeBtn} ${deliveryMode === 'delivery' ? styles.modeBtnActive : ''}`}
                  onClick={() => setDeliveryMode('delivery')}
                >
                  <span className={styles.modeIcon}>🛵</span>
                  <span className={styles.modeLabel}>{t('homeDelivery')}</span>
                  <span className={styles.modeNote}>{t('deliveryNote')}</span>
                </button>
                <button
                  className={`${styles.modeBtn} ${deliveryMode === 'pickup' ? styles.modeBtnActive : ''}`}
                  onClick={() => setDeliveryMode('pickup')}
                >
                  <span className={styles.modeIcon}>🏪</span>
                  <span className={styles.modeLabel}>{t('selfPickup')}</span>
                  <span className={styles.modeNote}>{t('pickupNote')}</span>
                </button>
              </div>
            </section>

            {/* Customer details */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('customerDetails')}</h2>
              <div className={styles.formGrid}>
                <Input
                  label={t('fullName')}
                  placeholder="Ramesh Kumar"
                  value={customer.name}
                  onChange={handleChange('name')}
                  error={errors.name}
                  required
                />
                <Input
                  label={t('phone')}
                  placeholder="9876543210"
                  value={customer.phone}
                  onChange={handleChange('phone')}
                  error={errors.phone}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
                <Input
                  label={t('email')}
                  placeholder="ramesh@email.com"
                  value={customer.email}
                  onChange={handleChange('email')}
                  error={errors.email}
                  type="email"
                />
                {deliveryMode === 'delivery' && (
                  <Input
                    label={t('address')}
                    placeholder={t('addressPlaceholder')}
                    value={customer.address}
                    onChange={handleChange('address')}
                    error={errors.address}
                    required
                  />
                )}
                <Textarea
                  label={t('notes')}
                  placeholder={t('notesPlaceholder')}
                  value={customer.notes}
                  onChange={handleChange('notes')}
                />
              </div>
            </section>
          </div>

          {/* Right col: order summary */}
          <div className={styles.summaryCol}>
            <div className={styles.summaryCard}>
              <h2 className={styles.sectionTitle}>{t('orderSummary')}</h2>

              <ul className={styles.itemList}>
                {items.map((item) => (
                  <li key={item.id} className={styles.orderItem}>
                    <span className={styles.itemEmoji}>{item.emoji}</span>
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemQty}>× {item.quantity}</span>
                    </div>
                    <span className={styles.itemTotal}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className={styles.divider} />

              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>{t('subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>{t('deliveryCharge')}</span>
                  <span className={deliveryCharge === 0 ? styles.freeText : ''}>
                    {deliveryCharge === 0 ? `${t('free')} 🎉` : formatPrice(deliveryCharge)}
                  </span>
                </div>
              </div>

              <div className={styles.totalRow}>
                <span>{t('total')}</span>
                <span className={styles.totalAmount}>{formatPrice(total)}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                onClick={handleSubmit}
                className={styles.placeOrderBtn}
              >
                {loading ? t('placing') : `${t('placeOrder')} →`}
              </Button>

              <p className={styles.otpNote}>
                📱 An OTP will be sent to your phone for verification
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
