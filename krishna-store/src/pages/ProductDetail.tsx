
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProduct } from '@/utils/api';
import { useStore } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import { ProductCard } from '@/components/ProductCard';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { formatPrice, getDiscount } from '@/utils/format';
import type { Product } from '@/types';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { items, addItem, updateQuantity, removeItem, setCartOpen } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    fetchProduct(id)
      .then(({ product, related }) => {
        setProduct(product);
        setRelated(related);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) return <PageSpinner label={t('loading')} />;
  if (error || !product) {
    return (
      <div className={styles.error}>
        <span>😕</span>
        <p>{t('error')}</p>
        <Button variant="secondary" onClick={() => navigate('/')}>{t('back')}</Button>
      </div>
    );
  }

  const cartItem = items.find((i) => i.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const discount = product.mrp ? getDiscount(product.price, product.mrp) : 0;
  const name = language === 'hi' ? product.nameHi : product.name;
  const description = language === 'hi' ? product.descriptionHi : product.description;

  const handleAdd = () => addItem(product);
  const handleIncrement = () => updateQuantity(product.id, quantity + 1);
  const handleDecrement = () => {
    if (quantity === 1) removeItem(product.id);
    else updateQuantity(product.id, quantity - 1);
  };
  const handleGoToCart = () => {
    setCartOpen(true);
  };

  return (
    <div className={styles.page}>
      <div className="page-container">
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          {t('back')}
        </button>

        <div className={styles.layout}>
          {/* Left — image/emoji */}
          <div className={styles.imageWrap}>
            <div className={styles.emojiDisplay}>
              <span className={styles.emoji}>{product.emoji}</span>
            </div>
            {discount > 0 && (
              <div className={styles.discountTag}>
                <span className={styles.discountPct}>{discount}%</span>
                <span className={styles.discountLabel}>OFF</span>
              </div>
            )}
          </div>

          {/* Right — details */}
          <div className={styles.details}>
            <div className={styles.categoryRow}>
              <Badge variant="purple">{product.category}</Badge>
              {product.inStock ? (
                <Badge variant="green">{t('inStock')}</Badge>
              ) : (
                <Badge variant="red">{t('outOfStock')}</Badge>
              )}
            </div>

            <h1 className={`${styles.name} ${language === 'hi' ? 'lang-hi' : ''}`}>
              {name}
            </h1>

            {product.unit && (
              <p className={styles.unit}>
                {t('perUnit')} {product.unit}
              </p>
            )}

            <p className={styles.description}>{description}</p>

            {product.tags && product.tags.length > 0 && (
              <div className={styles.tags}>
                {product.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>#{tag}</span>
                ))}
              </div>
            )}

            <div className={styles.priceRow}>
              <span className={styles.price}>{formatPrice(product.price)}</span>
              {product.mrp && (
                <>
                  <span className={styles.mrp}>
                    {t('mrp')} {formatPrice(product.mrp)}
                  </span>
                  <span className={styles.savings}>
                    Save {formatPrice(product.mrp - product.price)}
                  </span>
                </>
              )}
            </div>

            {product.inStock ? (
              <div className={styles.actions}>
                {quantity === 0 ? (
                  <Button variant="primary" size="lg" onClick={handleAdd} fullWidth>
                    + {t('addToCart')}
                  </Button>
                ) : (
                  <div className={styles.inCartActions}>
                    <QuantityStepper
                      quantity={quantity}
                      onIncrement={handleIncrement}
                      onDecrement={handleDecrement}
                      size="md"
                    />
                    <Button variant="success" size="lg" onClick={handleGoToCart} fullWidth>
                      🛒 {t('cart')} ({quantity})
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.actions}>
                <Button variant="ghost" size="lg" disabled fullWidth>
                  {t('outOfStock')}
                </Button>
              </div>
            )}

            <div className={styles.infoCards}>
              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>⚡</span>
                <div>
                  <strong>30 min delivery</strong>
                  <p>To your door in Krishnanagar</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>🏪</span>
                <div>
                  <strong>Free pickup</strong>
                  <p>Collect from store, no charge</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>{t('relatedProducts')}</h2>
            <div className={styles.relatedGrid}>
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
