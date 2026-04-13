import type {
  CatalogResponse,
  ProductDetailResponse,
  CustomerDetails,
  DeliveryMode,
  CartItem,
  OrderResponse,
  TrackResponse,
  Product,
} from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  const json = await res.json();
  return json.data ?? json;
}

// ── CATALOG ─────────────────────────────────────────────────────────────────

export async function fetchCatalog(): Promise<CatalogResponse> {
  try {
    return await apiFetch<CatalogResponse>('/api/catalog');
  } catch {
    // Fallback mock data for development/demo
    return getMockCatalog();
  }
}

export async function fetchProduct(id: string): Promise<ProductDetailResponse> {
  try {
    return await apiFetch<ProductDetailResponse>(`/api/catalog/${id}`);
  } catch {
    const mock = getMockCatalog();
    const product = mock.products.find((p) => p.id === id) ?? mock.products[0];
    const related = mock.products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
    return { product, related };
  }
}

// ── ORDERS ───────────────────────────────────────────────────────────────────

export async function placeOrder(payload: {
  items: CartItem[];
  customer: CustomerDetails;
  deliveryMode: DeliveryMode;
  total: number;
  deliveryCharge: number;
}): Promise<OrderResponse> {
  return apiFetch<OrderResponse>('/api/order', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyOtp(
  orderRef: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  return apiFetch('/api/order/verify', {
    method: 'POST',
    body: JSON.stringify({ orderRef, otp }),
  });
}

export async function resendOtp(
  orderRef: string
): Promise<{ success: boolean }> {
  return apiFetch('/api/order/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ orderRef }),
  });
}

export async function trackOrder(orderRef: string): Promise<TrackResponse> {
  try {
    return await apiFetch<TrackResponse>(`/api/track/${orderRef}`);
  } catch {
    // Mock tracking data
    return getMockTrackResponse(orderRef);
  }
}

// ── MOCK DATA ────────────────────────────────────────────────────────────────

function getMockCatalog(): CatalogResponse {
  const products: Product[] = [
    {
      id: 'p1',
      name: 'Aashirvaad Atta 5kg',
      nameHi: 'आशीर्वाद आटा 5 किग्रा',
      price: 249,
      mrp: 275,
      category: 'Grocery',
      emoji: '🌾',
      description: 'Premium whole wheat flour, stone ground',
      descriptionHi: 'प्रीमियम गेहूं का आटा, पत्थर से पिसा हुआ',
      inStock: true,
      unit: '5kg',
      tags: ['staple', 'flour'],
    },
    {
      id: 'p2',
      name: 'Amul Gold Milk 500ml',
      nameHi: 'अमूल गोल्ड दूध 500ml',
      price: 32,
      category: 'Dairy',
      emoji: '🥛',
      description: 'Full cream fresh milk, 6% fat',
      descriptionHi: 'फुल क्रीम ताज़ा दूध, 6% वसा',
      inStock: true,
      unit: '500ml',
      tags: ['daily', 'fresh'],
    },
    {
      id: 'p3',
      name: 'Haldiram Aloo Bhujia',
      nameHi: 'हल्दीराम आलू भुजिया',
      price: 30,
      mrp: 35,
      category: 'Snacks',
      emoji: '🥨',
      description: 'Crispy potato sev, classic Indian snack',
      descriptionHi: 'कुरकुरा आलू सेव, क्लासिक भारतीय नाश्ता',
      inStock: true,
      unit: '200g',
      tags: ['snack', 'crispy'],
    },
    {
      id: 'p4',
      name: 'Tata Tea Gold 500g',
      nameHi: 'टाटा टी गोल्ड 500g',
      price: 245,
      mrp: 260,
      category: 'Beverages',
      emoji: '🍵',
      description: 'Strong and aromatic blend of Assam teas',
      descriptionHi: 'असम चाय का मजबूत और सुगंधित मिश्रण',
      inStock: true,
      unit: '500g',
      tags: ['tea', 'morning'],
    },
    {
      id: 'p5',
      name: 'Vim Dishwash Bar',
      nameHi: 'विम डिशवाश बार',
      price: 32,
      category: 'Household',
      emoji: '🧼',
      description: 'Powerful grease-cutting lemon dishwash bar',
      descriptionHi: 'शक्तिशाली नींबू डिशवाश बार',
      inStock: true,
      unit: '500g',
      tags: ['cleaning', 'kitchen'],
    },
    {
      id: 'p6',
      name: 'Amul Butter 100g',
      nameHi: 'अमूल बटर 100g',
      price: 58,
      mrp: 62,
      category: 'Dairy',
      emoji: '🧈',
      description: 'Pasteurised table butter, salted',
      descriptionHi: 'पास्चुरीकृत टेबल बटर, नमकीन',
      inStock: true,
      unit: '100g',
      tags: ['dairy', 'breakfast'],
    },
    {
      id: 'p7',
      name: 'Parle-G Biscuits',
      nameHi: 'पार्ले-जी बिस्कुट',
      price: 10,
      category: 'Snacks',
      emoji: '🍪',
      description: "India's favourite glucose biscuit",
      descriptionHi: "भारत का पसंदीदा ग्लूकोज़ बिस्कुट",
      inStock: true,
      unit: '100g',
      tags: ['biscuit', 'kids'],
    },
    {
      id: 'p8',
      name: 'Tropicana Orange Juice 1L',
      nameHi: 'ट्रॉपिकाना ऑरेंज जूस 1L',
      price: 115,
      mrp: 130,
      category: 'Beverages',
      emoji: '🍊',
      description: 'Not from concentrate, 100% real fruit juice',
      descriptionHi: '100% असली फल का रस',
      inStock: true,
      unit: '1L',
      tags: ['juice', 'healthy'],
    },
    {
      id: 'p9',
      name: 'Fortune Sunflower Oil 1L',
      nameHi: 'फॉर्च्यून सनफ्लावर तेल 1L',
      price: 145,
      mrp: 160,
      category: 'Grocery',
      emoji: '🌻',
      description: 'Refined sunflower cooking oil, heart healthy',
      descriptionHi: 'रिफाइंड सूरजमुखी तेल, दिल के लिए स्वस्थ',
      inStock: true,
      unit: '1L',
      tags: ['oil', 'cooking'],
    },
    {
      id: 'p10',
      name: 'Dettol Hand Wash 200ml',
      nameHi: 'डेटॉल हैंड वॉश 200ml',
      price: 89,
      mrp: 99,
      category: 'Household',
      emoji: '🫧',
      description: 'Antibacterial hand wash, original scent',
      descriptionHi: 'एंटीबैक्टीरियल हैंड वॉश, ओरिजिनल सुगंध',
      inStock: true,
      unit: '200ml',
      tags: ['hygiene', 'health'],
    },
    {
      id: 'p11',
      name: 'Lay\'s Classic Salted',
      nameHi: "लेज़ क्लासिक सालटेड",
      price: 20,
      category: 'Snacks',
      emoji: '🥔',
      description: 'Thin crispy potato chips, lightly salted',
      descriptionHi: 'पतले कुरकुरे आलू के चिप्स, हल्के नमकीन',
      inStock: true,
      unit: '52g',
      tags: ['chips', 'party'],
    },
    {
      id: 'p12',
      name: 'Nescafé Classic 50g',
      nameHi: 'नेस्कैफे क्लासिक 50g',
      price: 175,
      mrp: 195,
      category: 'Beverages',
      emoji: '☕',
      description: 'Instant coffee with rich roasted aroma',
      descriptionHi: 'तुरंत कॉफी, भरपूर भुनी सुगंध के साथ',
      inStock: true,
      unit: '50g',
      tags: ['coffee', 'morning'],
    },
    {
      id: 'p13',
      name: 'Surf Excel 1kg',
      nameHi: 'सर्फ एक्सेल 1 किग्रा',
      price: 189,
      mrp: 210,
      category: 'Household',
      emoji: '🫧',
      description: 'Detergent powder for tough stain removal',
      descriptionHi: 'कठिन दाग हटाने के लिए डिटर्जेंट पाउडर',
      inStock: true,
      unit: '1kg',
      tags: ['laundry', 'cleaning'],
    },
    {
      id: 'p14',
      name: 'Amul Dahi 500g',
      nameHi: 'अमूल दही 500g',
      price: 55,
      mrp: 60,
      category: 'Dairy',
      emoji: '🥣',
      description: 'Fresh set curd, thick and creamy',
      descriptionHi: 'ताज़ा दही, गाढ़ा और मलाईदार',
      inStock: true,
      unit: '500g',
      tags: ['curd', 'probiotic'],
    },
    {
      id: 'p15',
      name: 'Maggi 2-Minute Noodles',
      nameHi: 'मैगी 2-मिनट नूडल्स',
      price: 14,
      category: 'Snacks',
      emoji: '🍜',
      description: 'The original Masala Maggi, 70g pack',
      descriptionHi: 'ओरिजिनल मसाला मैगी, 70g पैक',
      inStock: true,
      unit: '70g',
      tags: ['instant', 'kids'],
    },
    {
      id: 'p16',
      name: 'Basmati Rice 1kg',
      nameHi: 'बासमती चावल 1 किग्रा',
      price: 95,
      mrp: 110,
      category: 'Grocery',
      emoji: '🍚',
      description: 'Long grain aged basmati, aromatic',
      descriptionHi: 'लंबे दाने वाला पुराना बासमती, सुगंधित',
      inStock: true,
      unit: '1kg',
      tags: ['rice', 'staple'],
    },
    {
      id: 'p17',
      name: 'Colgate MaxFresh',
      nameHi: 'कोलगेट मैक्सफ्रेश',
      price: 99,
      mrp: 110,
      category: 'Household',
      emoji: '🦷',
      description: 'Gel toothpaste with cooling crystals',
      descriptionHi: 'कूलिंग क्रिस्टल के साथ जेल टूथपेस्ट',
      inStock: false,
      unit: '150g',
      tags: ['dental', 'hygiene'],
    },
    {
      id: 'p18',
      name: 'Paan Masala Supari',
      nameHi: 'पान मसाला सुपारी',
      price: 5,
      category: 'Snacks',
      emoji: '🌿',
      description: 'Assorted paan flavored mouth freshener',
      descriptionHi: 'विभिन्न पान स्वाद माउथ फ्रेशनर',
      inStock: true,
      unit: '4.2g',
      tags: ['mouth-freshener'],
    },
    {
      id: 'p19',
      name: 'Ashirvaad Namak 1kg',
      nameHi: 'आशीर्वाद नमक 1 किग्रा',
      price: 20,
      category: 'Grocery',
      emoji: '🧂',
      description: 'Iodised refined salt for daily cooking',
      descriptionHi: 'रोज़ाना खाना पकाने के लिए आयोडीन नमक',
      inStock: true,
      unit: '1kg',
      tags: ['staple', 'cooking'],
    },
    {
      id: 'p20',
      name: 'Britannia Good Day',
      nameHi: 'ब्रिटानिया गुड डे',
      price: 35,
      mrp: 40,
      category: 'Snacks',
      emoji: '🍪',
      description: 'Butter cookies with cashew and almond',
      descriptionHi: 'काजू और बादाम के साथ बटर कुकीज',
      inStock: true,
      unit: '150g',
      tags: ['biscuit', 'premium'],
    },
  ];

  return {
    products,
    categories: ['Grocery', 'Dairy', 'Snacks', 'Beverages', 'Household'],
  };
}

function getMockTrackResponse(orderRef: string): TrackResponse {
  return {
    order: {
      orderRef,
      status: 'accepted',
      items: [],
      customer: {
        name: 'Demo Customer',
        email: 'demo@example.com',
        phone: '9999999999',
        address: 'Krishnanagar',
        notes: '',
      },
      deliveryMode: 'delivery',
      total: 500,
      deliveryCharge: 40,
      paymentUrl: 'https://razorpay.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}
