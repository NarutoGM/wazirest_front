'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebard from '../components/dashboard/index';
import { Toaster, toast } from 'sonner';

const links: Record<string, string> = {
  basic: 'https://secure.micuentaweb.pe/t/dxzbpziz',
  medium: 'https://secure.micuentaweb.pe/t/wsom206l',
  pro: 'https://secure.micuentaweb.pe/t/b5vgd0wt',
};

const planes = [
  { id: 'basic', nombre: 'Plan Básico', descripcion: '1 instancia WhatsApp + 400 MB RAM', precio: 6, color: 'bg-green-100 text-green-800' },
  { id: 'medium', nombre: 'Suite Medium', descripcion: '3 instancias WhatsApp + 700 MB RAM', precio: 8, color: 'bg-blue-100 text-blue-800' },
  { id: 'pro', nombre: 'Suite Pro', descripcion: '7 instancias WhatsApp + 1 GB RAM', precio: 11, color: 'bg-purple-100 text-purple-800' },
];

function UpdateUserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [autoPago, setAutoPago] = useState(false);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const handlePagar = (planId: string) => {
    const link = links[planId];
    if (!link) {
      toast.error('Link de pago no disponible');
      return;
    }
    const url = new URL(link);
    if (session?.user?.email) {
      url.searchParams.set('email', session.user.email);
    }
    toast.success('Redirigiendo al pago...');
    setTimeout(() => {
      window.location.href = url.toString();
    }, 500);
  };

  return (
    <div className="p-5 max-w-5xl mx-auto">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4">Selecciona tu plan</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {planes.map(plan => (
          <div key={plan.id} className={`rounded-xl p-6 shadow-md border ${plan.color}`}>
            <h2 className="text-xl font-semibold">{plan.nombre}</h2>
            <p className="text-sm mt-2 mb-4">{plan.descripcion}</p>
            <p className="text-2xl font-bold mb-4">${plan.precio}</p>
            <label className="block mb-3 text-sm">
              <input
                type="checkbox"
                className="mr-2"
                checked={autoPago}
                onChange={e => setAutoPago(e.target.checked)}
              />
              Deseo pagos automáticos en el futuro
            </label>
            <button
              onClick={() => handlePagar(plan.id)}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              Pagar ahora
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Sidebard>
      <UpdateUserPage />
    </Sidebard>
  );
}
