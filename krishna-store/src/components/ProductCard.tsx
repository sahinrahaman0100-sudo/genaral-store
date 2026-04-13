import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { useTranslation } from '@/hooks/useTranslation';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, getDiscount } from '@/utils/format';
import type { Product } from '@/types';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { items, addItem, updateQuantity, removeItem } = useStore();

  const cartItem = items.find((i) => i.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const discount = product.mrp ? getDiscount(product.price, product.mrp) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
  };

  const handleIncrement = () => updateQuantity(product.id, quantity + 1);
  const handleDecrement = () => {
    if (quantity === 1) removeItem(product.id);
    else updateQuantity(product.id, quantity - 1);
  };

  const name = language === 'hi' ? product.nameHi : product.name;
  const description = language === 'hi' ? product.descriptionHi : product.description;

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={() => navigate(`/product/${product.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/product/${product.id}`)}
      aria-label={name}
    >
      <div className={styles.emojiWrap}>
        <span className={styles.emoji}>{product.emoji}</span>
        {discount > 0 && (
          <span className={styles.discountBadge}>{discount}% off</span>
        )}
        {!product.inStock && (
          <span className={styles.outOfStock}>{t('outOfStock')}</span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.categoryTag}>{product.category}</div>
        <h3 className={`${styles.name} ${language === 'hi' ? 'lang-hi' : ''}`}>{name}</h3>
        <p className={styles.description}>{description}</p>
        {product.unit && <span className={styles.unit}>{product.unit}</span>}

        <div className={styles.footer}>
          <div className={styles.priceGroup}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {product.mrp && (
              <span className={styles.mrp}>{formatPrice(product.mrp)}</span>
            )}
          </div>

          {product.inStock ? (
            quantity === 0 ? (
              <button
                className={styles.addBtn}
                onClick={handleAdd}
                aria-label={`Add ${name} to cart`}
              >
                + {t('addToCart')}
              </button>
            ) : (
              <div onClick={(e) => e.stopPropagation()}>
                <QuantityStepper
                  quantity={quantity}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  size="sm"
                />
              </div>
            )
          ) : (
            <Badge variant="red" size="sm">{t('outOfStock')}</Badge>
          )}
        </div>
      </div>
    </article>
  );
};
