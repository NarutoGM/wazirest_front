'use client';
import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebard from '../components/dashboard/index';
import { Toaster, toast } from 'sonner';
import { ArrowTopRightOnSquareIcon, PlusIcon, SparklesIcon, ArrowPathIcon, StopIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Image from 'next/image';

interface CustomSession {
  id?: string;
  firstName?: string;
  username?: string;
      jwt?: string;

}

interface WorkspaceStruture {
  id: number;
  documentId: string;
  name?: string | null;
  url?: string | null;
}

interface ProductField {
  [key: string]: string;
}

interface Product {
  name: string;
  img: string;
  fields: ProductField[];
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const username = (session as CustomSession | null)?.username;
  const typedSession = session as CustomSession | null;
  const router = useRouter();
  const [workspace, setWorkspaceStruture] = useState<WorkspaceStruture[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceStruture | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formValues, setFormValues] = useState<ProductField>({});

  const fetchWorkspaces = async () => {
    if (!typedSession?.id) return;
    try {
      const res = await fetch(`/api/suite?token=${typedSession.jwt}`, {
        headers: {
          Authorization: `Bearer ''`,
        },
      });
      if (!res.ok) {
        throw new Error(`Error API: ${res.status}`);
      }
      const data = await res.json();
      console.log('Datos de workspaces:', data);
      const fetchedWorkspaces: WorkspaceStruture[] = data.suites.map((item: any) => ({
        id: item.id,
        documentId: item.documentId,
        name: item.name || null,
        url: item.url || '',
      }));
      console.log('Datos obtenidos:', data);
      setWorkspaceStruture(fetchedWorkspaces);
    } catch (err: any) {
      console.error('Error al cargar workspaces:', err);
      setError(err.message || 'Error al cargar las sesiones.');
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      if (!res.ok) {
        throw new Error(`Error API: ${res.status}`);
      }
      const data = await res.json();
      console.log('Productos obtenidos:', data);
      setProducts(data);
      setLoadingProducts(false);
    } catch (err: any) {
      console.error('Error al cargar productos:', err);
      setError(err.message || 'Error al cargar los productos.');
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
    fetchProducts();
  }, [typedSession?.id]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const createNewWorkSpace = async (productName: string, fields: ProductField) => {
    try {
      await axios.post(
        '/api/suite',
        { users: typedSession?.id, productName, fields },
        { headers: { 'Content-Type': 'application/json' } }
      );
      toast.success('Nueva instancia creada con éxito');
      fetchWorkspaces();
    } catch (error: any) {
      console.error('Error al crear nueva instancia:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Error al crear nueva instancia');
    }
  };

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    // Initialize form values with default field values
    const initialValues: ProductField = {};
    product.fields.forEach((field) => {
      Object.entries(field).forEach(([key, value]) => {
        initialValues[key] = value;
      });
    });
    setFormValues(initialValues);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormValues({});
  };

  const handleConfirm = () => {
    if (selectedProduct) {
      createNewWorkSpace(selectedProduct.name, formValues);
      handleCloseModal();
    } else {
      toast.error('Por favor, selecciona un producto.');
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-screen">
      <Toaster richColors position="top-right" />

      {/* Left Sidebar (Fixed Width) */}
      <div className="w-64 p-5 text-white">
        <h1 className="text-2xl font-bold mb-6">Bienvenido, {username}</h1>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tu Suite 😎😎</h2>
          <button
            onClick={() => setSelectedWorkspace(null)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition"
          >
            <PlusIcon className="w-5 h-5" />
            {workspace.length === 0 && 'Prueba de n8n gratis por 7 días'}
          </button>
        </div>

        <div className="mb-5">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {workspace.length > 0 ? (
            <div className="flex flex-col divide-y divide-zinc-700">
              {workspace.map((workspaces) => (
                <button
                  key={workspaces.documentId}
                  className={`flex justify-between rounded-lg items-center py-3 px-2 text-left transition ${
                    selectedWorkspace?.documentId === workspaces.documentId
                      ? 'bg-zinc-500/40 text-white'
                      : 'hover:bg-zinc-500/40'
                  }`}
                  onClick={() => setSelectedWorkspace(workspaces)}
                >
                  <span className="text-white">{workspaces.name || 'Sin nombre'}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400">No tienes sesiones aún. Crea una nueva instancia.</p>
          )}
        </div>
      </div>

      {/* Right Content Area (Dynamic) */}
      <div className="flex-1 bg-zinc-900 p-5 text-white rounded-bl-3xl rounded-tl-3xl">
        {selectedWorkspace ? (
          <div>
            <div className="mb-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Nombre:</span>
                <span>{selectedWorkspace.name || 'Sin nombre'}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedWorkspace.url ? (
                  <span className="flex items-center gap-1">
                    <a
                      href={selectedWorkspace.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300"
                      title="Abrir en nueva pestaña"
                    >
                      <ArrowTopRightOnSquareIcon className="w-6 h-6" />
                    </a>
                  </span>
                ) : (
                  <span className="text-zinc-400">No disponible</span>
                )}
              </div>
              <div className="flex flex-row gap-3 mt-4">
                <button
                  className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition text-sm"
                  title="Reiniciar"
                >
                  <ArrowPathIcon className="w-7 h-7" />
                </button>
                <button
                  className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition text-sm"
                  title="Parar"
                >
                  <StopIcon className="w-7 h-7" />
                </button>
                <button
                  className="flex items-center gap-1 bg-zinc-700 hover:bg-zinc-800 text-white px-3 py-1 rounded transition text-sm"
                  title="Eliminar"
                >
                  <XMarkIcon className="w-7 h-7" />
                </button>
              </div>
            </div>
            <div className="bg-zinc-800 rounded-lg p-6 shadow-md mb-4">
              <h3 className="text-lg font-semibold mb-2">Uso de Recursos</h3>
              <div className="mb-3">
                <span className="block text-zinc-400 mb-1">CPU</span>
                <div className="w-full bg-zinc-700 rounded-full h-4">
                  <div className="bg-emerald-500 h-4 rounded-full" style={{ width: `32%` }} />
                </div>
                <span className="text-sm text-zinc-300">32% usado</span>
              </div>
              <div className="mb-3">
                <span className="block text-zinc-400 mb-1">Memoria</span>
                <div className="w-full bg-zinc-700 rounded-full h-4">
                  <div className="bg-emerald-400 h-4 rounded-full" style={{ width: `54%` }} />
                </div>
                <span className="text-sm text-zinc-300">
                  860 mb / 1600 mb
                </span>
              </div>
              <div>
                <span className="block text-zinc-400 mb-1">Almacenamiento</span>
                <div className="w-full bg-zinc-700 rounded-full h-4">
                  <div className="bg-emerald-300 h-4 rounded-full" style={{ width: `12%` }} />
                </div>
                <span className="text-sm text-zinc-300">
                  2.4 GB / 20 GB
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedWorkspace(null)}
              className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition"
            >
              Volver
            </button>
          </div>
        ) : (
          <div>
            {loadingProducts ? (
              <p className="text-zinc-400">Cargando productos...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product, index) => (
                  <div
                    key={index}
                    className="bg-zinc-800 rounded-lg p-4 shadow-md flex flex-col h-full cursor-pointer hover:bg-zinc-700 transition"
                    onClick={() => handleOpenModal(product)}
                  >
                    <div className="flex-1 flex items-center justify-center mb-2">
                      <Image
                        src={product.img}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="object-contain w-full h-40 rounded-md"
                        style={{ maxHeight: '80px', width: '100%' }}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-center">{product.name}</h3>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-400">No hay productos disponibles.</p>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedProduct && (
        <div
          className="fixed inset-0  flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-zinc-800 p-6 rounded-lg shadow-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-white">Crear Nueva Instancia</h2>
            <p className="text-zinc-300 mb-4">
              Configura los detalles para la nueva instancia de{' '}
              <span className="font-bold">{selectedProduct.name}</span>
            </p>
            <div className="space-y-4">
              {selectedProduct.fields.map((field, index) => (
          <div key={index}>
            {Object.entries(field).map(([key, value]) => (
              <div key={key} className="mb-4">
                <label className="block text-zinc-300 mb-1 capitalize">
            {key.replace(/_/g, ' ')}
                </label>
                <input
            type="text"
            value={formValues[key] || ''}
            onChange={(e) => handleInputChange(key, e.target.value)}
            className="w-full bg-zinc-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                />
              </div>
            ))}
          </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
          onClick={handleCloseModal}
          className="bg-zinc-600 text-white px-4 py-2 rounded-md hover:bg-zinc-700 transition"
              >
          Cancelar
              </button>
              <button
          onClick={handleConfirm}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition"
              >
          OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Sidebard>
      <DashboardContent />
    </Sidebard>
  );
}