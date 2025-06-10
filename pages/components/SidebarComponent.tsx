'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { SessionProvider, useSession } from 'next-auth/react';

interface WooCommerceProduct {
  id: number;
  name: string;
  description: string;
  permalink: string;
  price: string;
  images: { src: string }[];
}

// ProductCard Component (unchanged)
function ProductCard({ product }: { product: WooCommerceProduct }) {
  const { data: session, status } = useSession();
 

const checkoutUrl = `https://wazilrest-wordpress.xwk85y.easypanel.host/?clear_cart_and_add=${product.id}&email=${encodeURIComponent(session?.email ?? '')}`;
  
 // const checkoutUrl = `https://wazilrest-wordpress.xwk85y.easypanel.host/checkout/?add-to-cart=${product.id}`;
  const imageUrl = product.images && product.images.length > 0 ? product.images[0].src : '/placeholder-image.jpg';

  return (
    <div className="p-4 border border-zinc-700 rounded-lg shadow-md shadow-cyan-800 bg-zinc-900/50 transition-all duration-300 hover:shadow-cyan-600 hover:scale-105 flex flex-col">
      <div className="flex flex-row items-center gap-4">
        <div className="w-20 h-20 flex-shrink-0 relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain rounded-md"
            onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 to-transparent rounded-md"></div>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-2 items-center">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 font-semibold">Nombre</span>
            <span className="text-md font-bold text-white truncate">{product.name}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 font-semibold">Precio</span>
            <span className="text-md font-semibold text-cyan-400">${product.price}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 font-semibold">Acción</span>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 bg-cyan-600 text-white px-3 py-1 rounded-lg hover:bg-cyan-700 transition-all duration-200 text-center font-medium"
            >
              Comprar
            </a>
          </div>
        </div>
      </div>
      <div className="text-xs text-zinc-400 mt-2 line-clamp-2">{product.description}</div>
    </div>
  );
}

// SidebarComponent: Controls sidebar visibility and handles product fetching and filtering
interface SidebarComponentProps {
  isOpen: boolean;
  onToggle: () => void;
  initialFilter: 'all' | 'plan' | 'no-plan';
}

export default function SidebarComponent({
  isOpen,
  onToggle,
  initialFilter,
}: SidebarComponentProps) {
  const [filterType, setFilterType] = useState<'all' | 'plan' | 'no-plan'>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<WooCommerceProduct[]>([]);

  // Define the fetcher function for SWR
  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      throw new Error(`Error fetching products: ${res.status}`);
    }
    const data = await res.json();
    // Transform WooCommerce API response to WooCommerceProduct format
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description.replace(/<[^>]+>/g, ''), // Strip HTML tags
      permalink: item.permalink,
      price: item.price,
      images: item.images || [],
    }));
  };

  // Fetch products using SWR
  const { data: products, error: productsError, isLoading: productsLoading } = useSWR<WooCommerceProduct[]>(
    '/api/products',
    fetcher,
    {
      refreshInterval: 5000, // Refresh every 5 seconds
    }
  );

  useEffect(() => {
    if (!products) return;

    let filtered = products;

    // Apply name-based filtering
    filtered = filtered.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply filter type
    if (filterType === 'plan') {
      filtered = filtered.filter((product) => product.name.trim().toLowerCase().startsWith('plan'));
    } else if (filterType === 'no-plan') {
      filtered = filtered.filter((product) => !product.name.trim().toLowerCase().startsWith('plan'));
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, filterType]);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-xl bg-zinc-900/95 backdrop-blur-md p-8 shadow-lg transform transition-transform duration-500 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } overflow-y-auto`}
      onMouseLeave={() => isOpen && onToggle()} // Close sidebar when mouse leaves
    >
      <button
        onClick={onToggle}
        className="absolute top-4 right-4 text-zinc-300 hover:text-white transition-colors"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h2 className="text-2xl font-bold text-white mb-6 tracking-tight">Productos Disponibles</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-cyan-500"
        />
      </div>
   
      {productsLoading ? (
        <p className="text-zinc-400">Cargando productos...</p>
      ) : productsError ? (
        <p className="text-red-500">{productsError.message || 'Error al cargar productos.'}</p>
      ) : filteredProducts.length > 0 ? (
        <div className="space-y-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-zinc-400">No hay productos disponibles.</p>
      )}
    </div>
  );
}