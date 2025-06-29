'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Sidebard from '../components/dashboard/index';

// Add this declaration to let TypeScript know about window.Izipay
declare global {
  interface Window {
    Izipay: any;
  }
}

interface CustomSession {
  id?: string;
  jwt?: string;
  firstName?: string;
}



function UpdateUserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [iziLoaded, setIziLoaded] = useState(false);
  const [iziConfig, setIziConfig] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status]);

  useEffect(() => {
    // Cargar SDK dinámicamente (sandbox o producción)
    const script = document.createElement('script');
    script.src = 'https://sandbox-checkout.izipay.pe/payments/v1/js/index.js';
    script.defer = true;
    script.onload = () => setIziLoaded(true);
    document.head.appendChild(script);
  }, []);

  const handleRegisterCard = async () => {
    if (!iziLoaded) return alert('SDK not loaded yet');
    // Obtener tokenSession y keyRSA
    const { data } = await axios.post('/api/izipay/session');
    setIziConfig({
      config: { action: 'register', render: { typeForm: 'pop-up' } },
      authorization: data.tokenSession,
      keyRSA: data.keyRSA
    });
  };

  useEffect(() => {
    if (!iziConfig) return;
    const checkout = new window.Izipay({ config: iziConfig.config });
    checkout.LoadForm({
      authorization: iziConfig.authorization,
      keyRSA: iziConfig.keyRSA,
      callbackResponse: async (resp: any) => {
        console.log('iZipay register response:', resp);
        const cardToken = resp.response.token.cardToken;
        await axios.post('/api/subscribe', {
          email: session?.user?.email,
          cardToken,
          plan: 'Basic' // o dinámico
        });
        alert('✅ Tarjeta registrada y token almacenado.');
        setIziConfig(null);
      }
    });
  }, [iziConfig]);

  return (
    <div className="p-6">
      <h1>Register Card for Recurring Payments</h1>
      <button
        className="mt-4 p-2 bg-blue-600 text-white rounded"
        onClick={handleRegisterCard}
      >
        Registrar tarjeta
      </button>
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