import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { trackOrder } from '@/utils/api';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { fireConfetti } from '@/utils/confetti';
import { formatPrice, formatDate } from '@/utils/format';
import type { Order, OrderStatus } from '@/types';
import styles from './OrderTracking.module.css';

const STATUS_STEPS: { key: OrderStatus; icon: string; labelKey: string; descKey: string }[] = [
  { key: 'verified',  icon: '✅', labelKey: 'statusVerified',  descKey: 'statusVerifiedDesc'  },
  { key: 'accepted',  icon: '🤝', labelKey: 'statusAccepted',  descKey: 'statusAcceptedDesc'  },
  { key: 'paid',      icon: '💳', labelKey: 'statusPaid',      descKey: 'statusPaidDesc'      },
  { key: 'shipped',   icon: '🚀', labelKey: 'statusShipped',   descKey: 'statusShippedDesc'   },
  { key: 'delivered', icon: '🎉', labelKey: 'statusDelivered', descKey: 'statusDeliveredDesc' },
];

const STATUS_ORDER: OrderStatus[] = ['verified', 'accepted', 'paid', 'shipped', 'delivered'];

function getStepIndex(status: OrderStatus): number {
  return STATUS_ORDER.indexOf(status);
}

export default function OrderTracking() {
  const { orderRef: paramRef } = useParams<{ orderRef?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [inputRef, setInputRef] = useState(paramRef ?? searchParams.get('ref') ?? '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!paramRef);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const confettiFired = useRef(false);

  const loadOrder = useCallback(async (ref: string) => {
    if (!ref.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { order } = await trackOrder(ref.trim());
      setOrder(order);

      // Fire confetti on delivery or if payment callback
      if (
        (order.status === 'delivered' || searchParams.get('payment') === 'success') &&
        !confettiFired.current
      ) {
        confettiFired.current = true;
        setPaymentSuccess(searchParams.get('payment') === 'success');
        setTimeout(fireConfetti, 400);
      }
    } catch {
      setError(t('notFound'));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [searchParams, t]);

  // Auto-load if orderRef in URL
  useEffect(() => {
    if (paramRef) loadOrder(paramRef);
  }, [paramRef, loadOrder]);

  // Poll every 20s when order is active
  useEffect(() => {
    if (!order || order.status === 'delivered') return;
    const id = setInterval(() => loadOrder(order.orderRef), 20_000);
    return () => clearInterval(id);
  }, [order, loadOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputRef.trim()) return;
    navigate(`/track/${inputRef.trim()}`, { replace: true });
    loadOrder(inputRef.trim());
  };

  const currentStepIdx = order ? getStepIndex(order.status) : -1;

  return (
    <div className={styles.page}>
      <div className="page-container">
        <h1 className={styles.title}>{t('trackOrder')}</h1>

        {/* Search form */}
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <Input
            placeholder={t('enterOrderRef')}
            value={inputRef}
            onChange={(e) => setInputRef(e.target.value)}
            fullWidth
          />
          <Button variant="primary" size="md" type="submit" loading={loading}>
            {t('trackNow')}
          </Button>
        </form>

        {loading && <PageSpinner label={t('loading')} />}

        {error && !loading && (
          <div className={styles.notFound}>
            <span>📦</span>
            <p>{t('notFound')}</p>
            <p className={styles.notFoundHint}>{t('notFoundHint')}</p>
          </div>
        )}

        {/* Payment success banner */}
        {paymentSuccess && (
          <div className={styles.successBanner}>
            <span className={styles.successIcon}>🎉</span>
            <div>
              <h2 className={styles.successTitle}>{t('paymentSuccess')}</h2>
              <p>{t('paymentSuccessMsg')}</p>
            </div>
          </div>
        )}

        {order && !loading && (
          <div className={styles.orderCard}>
            {/* Header */}
            <div className={styles.orderHeader}>
              <div>
                <p className={styles.orderLabel}>{t('orderRef')}</p>
                <p className={styles.orderRefDisplay}>{order.orderRef}</p>
              </div>
              <div className={styles.orderMeta}>
                <Badge variant={order.status === 'delivered' ? 'green' : 'purple'}>
                  {t(STATUS_STEPS.find(s => s.key === order.status)!.labelKey as Parameters<typeof t>[0])}
                </Badge>
                <p className={styles.orderDate}>
                  {t('orderDate')}: {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className={styles.timeline}>
              {STATUS_STEPS.map((step, idx) => {
                const isDone    = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const isLast    = idx === STATUS_STEPS.length - 1;
                return (
                  <div key={step.key} className={styles.timelineItem}>
                    <div className={styles.timelineLeft}>
                      <div
                        className={`${styles.dot} ${isDone ? styles.dotDone : ''} ${isCurrent ? styles.dotCurrent : ''}`}
                      >
                        {isDone ? <span>{step.icon}</span> : <span className={styles.dotInner} />}
                      </div>
                      {!isLast && (
                        <div
                          className={`${styles.connector} ${idx < currentStepIdx ? styles.connectorDone : ''}`}
                        />
                      )}
                    </div>
                    <div className={`${styles.timelineContent} ${isCurrent ? styles.timelineContentCurrent : ''}`}>
                      <p className={`${styles.stepLabel} ${isDone ? styles.stepLabelDone : ''}`}>
                        {t(step.labelKey as Parameters<typeof t>[0])}
                        {isCurrent && <span className={styles.currentBadge}>Current</span>}
                      </p>
                      <p className={styles.stepDesc}>
                        {t(step.descKey as Parameters<typeof t>[0])}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment CTA — shown when accepted */}
            {order.status === 'accepted' && order.paymentUrl && (
              <div className={styles.paySection}>
                <div className={styles.payBanner}>
                  <div>
                    <h3 className={styles.payTitle}>Ready to pay?</h3>
                    <p className={styles.payAmount}>
                      Total: <strong>{formatPrice(order.total)}</strong>
                    </p>
                  </div>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={() => window.open(order.paymentUrl, '_blank')}
                  >
                    💳 {t('payNow')}
                  </Button>
                </div>
              </div>
            )}

            {/* Shipping info — shown when shipped */}
            {order.status === 'shipped' && order.shippingInfo && (
              <div className={styles.shippingSection}>
                <h3 className={styles.shippingTitle}>{t('shippingDetails')}</h3>
                <div className={styles.shippingGrid}>
                  {order.shippingInfo.trackingId && (
                    <div className={styles.shippingItem}>
                      <span className={styles.shippingLabel}>{t('trackingId')}</span>
                      <span className={styles.shippingValue}>{order.shippingInfo.trackingId}</span>
                    </div>
                  )}
                  {order.shippingInfo.carrier && (
                    <div className={styles.shippingItem}>
                      <span className={styles.shippingLabel}>{t('carrier')}</span>
                      <span className={styles.shippingValue}>{order.shippingInfo.carrier}</span>
                    </div>
                  )}
                  {order.shippingInfo.estimatedTime && (
                    <div className={styles.shippingItem}>
                      <span className={styles.shippingLabel}>{t('estimatedDelivery')}</span>
                      <span className={styles.shippingValue}>{order.shippingInfo.estimatedTime}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order summary */}
            <div className={styles.orderSummarySection}>
              <h3 className={styles.shippingTitle}>{t('orderSummary')}</h3>
              <ul className={styles.summaryItems}>
                {order.items.map((item) => (
                  <li key={item.id} className={styles.summaryItem}>
                    <span>{item.emoji} {item.name}</span>
                    <span>{item.quantity} × {formatPrice(item.price)}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.summaryTotal}>
                <span>{t('total')}</span>
                <span className={styles.totalAmt}>{formatPrice(order.total)}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => navigate('/')}>
                {t('continueShopping')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
