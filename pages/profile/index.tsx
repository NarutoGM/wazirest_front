'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Sidebard from '../components/dashboard/index';
import { EyeIcon, EyeSlashIcon, KeyIcon } from '@heroicons/react/24/outline';

function UpdateUserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isKeyVisible, setIsKeyVisible] = useState(false); // Estado para controlar la visibilidad del key

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`,
          {
            headers: {
              Authorization: `Bearer ${session?.jwt}`,
            },
          }
        );

        const userData = response.data;
        console.log(userData);
        setEmail(userData.email || '');
        setUsername(userData.username || '');
        setKey(userData.key || '');
      } catch (error: any) {
        console.error('Error al obtener la información del usuario:', error.response?.data || error.message);
        setError('Error al obtener la información del usuario: ' + (error.response?.data?.error?.message || error.message));
      }
    };

    if (session?.jwt) {
      fetchUserData();
    }
  }, [session]);

  const generateKey = () => {
    const newKey = Math.random().toString(36).substring(2, 15);
    setKey(newKey);
  };

  const handleSave = async () => {
    try {
      const postData: Record<string, string> = {};
      if (username) postData.username = username;
      if (key) postData.key = key;

      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${session?.jwt}`,
            'Content-Type': 'application/json',
          },
        }
      );

      alert('Información actualizada con éxito');
      setError(null);
    } catch (error: any) {
      console.error('Error al actualizar la información:', error.response?.data || error.message);
      setError('Error al actualizar la información: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Actualizar Información del Usuario</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="space-y-4">
        <div>
          <label className="block text-zinc-400 font-medium mb-1">Correo Electrónico</label>
          <input
            type="email"
            value={email}
            readOnly
            className="p-2 w-full text-zinc-400 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-zinc-400 font-medium mb-1">Nombre de Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nuevo nombre de usuario"
            className="p-2 w-full text-zinc-400 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-zinc-400 font-medium mb-1">Secret key</label>
          <div className="flex items-center space-x-2">
            <div className="relative w-full">
              <input
                type={isKeyVisible ? 'text' : 'password'} // Cambia el tipo de input según el estado
                value={key}
                readOnly
                className="p-2 w-full text-zinc-400 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none pr-10"
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <button
                  onClick={() => setIsKeyVisible(!isKeyVisible)} // Alterna la visibilidad
                  className="text-zinc-400 hover:text-white"
                >
                  {isKeyVisible ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <button
              onClick={generateKey}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center space-x-1"
            >
              <KeyIcon className="w-5 h-5" />
              <span>Generar</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 w-full rounded-md hover:bg-green-700 transition mt-4"
        >
          Guardar
        </button>
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
