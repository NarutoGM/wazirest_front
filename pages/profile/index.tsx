'use client';
import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Sidebard from '../components/dashboard/index';
interface CustomSession {
  id?: string;
  jwt?: string;
  firstName?: string;
}

interface WhatsAppSession {
  id: number;
  documentId: string;
  user: string;
  webhook_url: string | null;
  is_connected: boolean;
  name?: string; // Add name
  profilePicUrl?: string | null; // Add profile picture URL
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const username = useSession().data?.username;

  const typedSession = session as CustomSession | null;
  const router = useRouter();
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [webhookInputs, setWebhookInputs] = useState<{ [key: string]: string }>({});
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [loadingSessions, setLoadingSessions] = useState<boolean>(true);
  const [loadingQrs, setLoadingQrs] = useState<{ [key: string]: boolean }>({});
  const [profiles, setProfiles] = useState<{ [key: string]: { name?: string; profilePicUrl?: string | null } }>({});
  // Cargar sesiones
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchUserSessions();
    }
  }, [status, router]);

  // Cargar QRs después de que las sesiones estén disponibles
  useEffect(() => {
    if (sessions.length > 0) {
      fetchQrsForDisconnectedSessions();
    }
  }, [sessions]);

  const fetchUserSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/instances`, {
        headers: { Authorization: `Bearer ${typedSession?.jwt}` },
        params: {
          'filters[users][id][$eq]': typedSession?.id,
          populate: '*',
        },
      });

      const fetchedSessions: WhatsAppSession[] = res.data.data.map((item: any) => ({
        id: item.id,
        documentId: item.documentId,
        user: item.users[0]?.id || typedSession?.id,
        webhook_url: item.webhook_url || null,
        is_connected: item.is_connected || false,
      }));

      setSessions(fetchedSessions);

      // Inicializar inputs de webhook
      const initialWebhooks = fetchedSessions.reduce(
        (acc, session) => ({
          ...acc,
          [session.documentId]: session.webhook_url || '',
        }),
        {}
      );
      setWebhookInputs(initialWebhooks);


      fetchedSessions.forEach((session) => {
        if (session.is_connected) {
          fetchProfileData(session.documentId);
        }
      });


      setError(null);
    } catch (error: any) {
      console.error('Error al cargar las sesiones:', error.response?.data || error.message);
      setError('Error al cargar las sesiones.');
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchQrsForDisconnectedSessions = async () => {
    const disconnectedSessions = sessions.filter((session) => !session.is_connected);
    const initialLoadingQrs = disconnectedSessions.reduce(
      (acc, session) => ({ ...acc, [session.documentId]: true }),
      {}
    );
    setLoadingQrs(initialLoadingQrs);

    await Promise.all(
      disconnectedSessions.map(async (session) => {
        try {
          const qrRes = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate-qr`,
            { clientId: session.documentId },
            { headers: { 'Content-Type': 'application/json' } }
          );
          if (qrRes.data.qr) {
            setQrCodes((prev) => ({ ...prev, [session.documentId]: qrRes.data.qr }));
          }
        } catch (err: any) {
          console.error(`Error fetching QR for ${session.documentId}:`, err.response?.data || err.message);
          setError(`Error al obtener QR para ${session.documentId}`);
        } finally {
          setLoadingQrs((prev) => ({ ...prev, [session.documentId]: false }));
        }
      })
    );
  };

  const createNewInstance = async () => {
    try {
      const postData = {
        data: {
          users: typedSession?.id,
          webhook_url: null,
          is_connected: false,
        },
      };
      await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/instances`, postData, {
        headers: {
          Authorization: `Bearer ${typedSession?.jwt}`,
          'Content-Type': 'application/json',
        },
      });
      setError(null);
      await fetchUserSessions();
    } catch (error: any) {
      console.error('Error al crear la instancia:', error.response?.data || error.message);
      setError('Error al crear la instancia: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const deleteInstance = async (documentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta instancia?')) return;

    try {
      // Step 1: Delete instance from Strapi
      await axios.delete(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/instances/${documentId}`, {
        headers: { Authorization: `Bearer ${typedSession?.jwt}` },
      });

      // Step 2: Call server to delete session and webhook data
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delete-session/${documentId}`, {
        headers: { 'Content-Type': 'application/json', },
      });

      setError(null);
      await fetchUserSessions();
    } catch (error: any) {
      console.error('Error al eliminar la instancia:', error.response?.data || error.message);
      setError('Error al eliminar la instancia: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const updateWebhook = async (documentId: string) => {
    try {
      const webhookUrl = webhookInputs[documentId];
      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/instances/${documentId}`,
        {
          data: { webhook_url: webhookUrl },
        },
        {
          headers: {
            Authorization: `Bearer ${typedSession?.jwt}`,
            'Content-Type': 'application/json',
          },
        }
      );
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update-weebhook/${documentId}`,
        { webhook_url: webhookUrl },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setError(null);
      //  await fetchUserSessions();
      alert('Webhook actualizado con éxito');
    } catch (error: any) {
      console.error('Error al actualizar el webhook:', error.response?.data || error.message);
      setError('Error al actualizar el webhook: ' + (error.response?.data?.error?.message || error.message));
    }
  };

  const handleWebhookChange = (documentId: string, value: string) => {
    setWebhookInputs((prev) => ({
      ...prev,
      [documentId]: value,
    }));
  };

  const fetchProfileData = async (documentId: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profile/${documentId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      setProfiles((prev) => ({
        ...prev,
        [documentId]: {
          name: res.data.name,
          profilePicUrl: res.data.profilePicUrl,
        },
      }));
    } catch (error: any) {
      console.error(`Error fetching profile for ${documentId}:`, error.response?.data || error.message);
      setProfiles((prev) => ({
        ...prev,
        [documentId]: { name: 'Unknown', profilePicUrl: null },
      }));
    }
  };


  return (
    <div className="">
      <div className="p-5 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          Bienvenido, {username}
        </h1>

        <div className="mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              Tus Sesiones
            </h2>
            <button
              onClick={createNewInstance}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              + Nueva Instancia
            </button>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {loadingSessions ? (
            <p className="text-zinc-400">Cargando sesiones...</p>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


              {sessions.map((session) => (
                <div
                  key={session.documentId}
                  className="bg-zinc-800 rounded-lg  shadow-md p-3 hover:shadow-lg transition-shadow duration-300 border border-zinc-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {profiles[session.documentId]?.profilePicUrl ? (
                        <img
                          src={profiles[session.documentId].profilePicUrl}
                          alt="Profile"
                          className="w-20 h-20 border-4 border-green-500 rounded-full object-cover"
                          onError={(e) => (e.currentTarget.src = '/default-profile.png')}
                        />
                      ) : (
                        <div className="w-10 h-10  rounded-full bg-zinc-600 flex items-center justify-center">
                          <span className="text-white text-sm">
                            {profiles[session.documentId]?.name?.charAt(0) || 'I'}
                          </span>
                        </div>
                      )}
                      <h3 className="text-xl font-semibold text-white">
                        {profiles[session.documentId]?.name || 'Instancia'} 
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${session.is_connected
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {session.is_connected ? 'Conectada' : 'Desconectada'}
                      </span>
                      <button
                        onClick={() => deleteInstance(session.documentId)}
                        className="text-green-500 hover:text-green-700"
                        title="Eliminar instancia"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-zinc-400">
                      <span className="font-medium">ClientId:</span> {session.documentId}
                    </p>
                    <div>
                      <label className="text-zinc-400 font-medium block mb-1">Webhook:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={webhookInputs[session.documentId] || ''}
                          onChange={(e) => handleWebhookChange(session.documentId, e.target.value)}
                          placeholder="https://ejemplo.com/webhook"
                          className="p-2 w-full text-zinc-400 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                          onClick={() => updateWebhook(session.documentId)}
                          className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                    {!session.is_connected && (
                      <div>
                        <label className="text-zinc-400 font-medium block mb-1">Escanea este QR:</label>
                        {loadingQrs[session.documentId] ? (
                          <p className="text-zinc-400 text-center">Cargando QR...</p>
                        ) : qrCodes[session.documentId] ? (
                          <>
                            <img
                              src={qrCodes[session.documentId]}
                              alt="WhatsApp QR"
                              className="w-32 h-32 mx-auto"
                              onError={(e) => {
                                console.error('Error al cargar QR:', e);
                                setQrCodes((prev) => ({ ...prev, [session.documentId]: '' }));
                              }}
                            />
                            <p className="text-xs text-zinc-400 mt-2 text-center">
                              Escanea con WhatsApp / Ajustes / Dispositivos vinculados
                            </p>
                          </>
                        ) : (
                          <p className="text-red-500 text-center">No se pudo cargar el QR</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}


            </div>
          ) : (
            <p className="text-zinc-400">No tienes sesiones aún. Crea una nueva instancia.</p>
          )}
        </div>
      </div>
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