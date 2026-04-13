
import { fetchCatalog } from '@/utils/api';
import { useTranslation } from '@/hooks/useTranslation';
import { ProductCard } from '@/components/ProductCard';
import { PageSpinner } from '@/components/ui/Spinner';
import type { Product } from '@/types';
import styles from './Home.module.css';

export default function Home() {
  const { t, language } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCatalog()
      .then(({ products, categories }) => {
        setProducts(products);
        setCategories(categories);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameHi.includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeCategory, search]);

  if (loading) return <PageSpinner label={t('loading')} />;

  if (error) {
    return (
      <div className={styles.error}>
        <span>⚠️</span>
        <p>{t('error')}</p>
        <button onClick={() => window.location.reload()}>{t('retry')}</button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Hero banner */}
      <div className={styles.hero}>
        <div className="page-container">
          <div className={styles.heroInner}>
            <div>
              <h1 className={`${styles.heroTitle} ${language === 'hi' ? 'lang-hi' : ''}`}>
                {t('storeName')} 🛕
              </h1>
              <p className={styles.heroTagline}>{t('tagline')}</p>
              <div className={styles.heroPills}>
                <span className={styles.pill}>⚡ 30-min delivery</span>
                <span className={styles.pill}>📍 Krishnanagar</span>
                <span className={styles.pill}>🆓 Free pickup</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container">
        {/* Search */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className={styles.pills} role="tablist" aria-label="Product categories">
          <button
            role="tab"
            aria-selected={activeCategory === 'all'}
            className={`${styles.pill} ${activeCategory === 'all' ? styles.pillActive : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            {t('allCategories')}
            <span className={styles.pillCount}>{products.length}</span>
          </button>
          {categories.map((cat) => {
            const catEmojis: Record<string, string> = {
              Grocery: '🌾', Dairy: '🥛', Snacks: '🍪', Beverages: '☕', Household: '🧹',
            };
            const count = products.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {catEmojis[cat] ?? '📦'} {cat}
                <span className={styles.pillCount}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔍</span>
            <p className={styles.emptyTitle}>{t('noProducts')}</p>
            <p className={styles.emptyHint}>{t('noProductsHint')}</p>
          </div>
        ) : (
          <>
            <p className={styles.resultsCount}>
              {filtered.length} {filtered.length === 1 ? t('item') : t('items')}
              {activeCategory !== 'all' && ` in ${activeCategory}`}
            </p>
            <div className={styles.grid}>
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
