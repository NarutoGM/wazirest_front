'use client';
import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Sidebard from '../components/dashboard/index';
import { PauseIcon, PlayIcon, XMarkIcon, PowerIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { Toaster, toast } from 'sonner';
import useSWR from 'swr';

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
  is_active: boolean;
  state: string;
  name?: string;
  profilePicUrl?: string | null;
  message_received?: boolean;
  message_sent?: boolean;
  qr?: string;
  qr_loading?: boolean;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const username = useSession().data?.username;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const typedSession = session as CustomSession | null;
  const router = useRouter();
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [webhookInputs, setWebhookInputs] = useState<{ [key: string]: string }>({});
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [loadingQrs, setLoadingQrs] = useState<{ [key: string]: boolean }>({});
  const [profiles, setProfiles] = useState<{ [key: string]: { name?: string; profilePicUrl?: string | null; number?: string | null } }>({});

  const [webhookSettings, setWebhookSettings] = useState<{
    message_received: boolean;
    message_sent: boolean;
  }>({ message_received: false, message_sent: false });

  // Define the fetcher function for SWR
  const fetcher = async (url: string, token: string) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error(`Error en respuesta: ${res.status} ${res.statusText}`);
      throw new Error(`Error API: ${res.status}`);
    }

    const data = await res.json();

    // Transform the response data into WhatsAppSession format
    const fetchedSessions: WhatsAppSession[] = data.data.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      user: item.users[0]?.id || typedSession?.id || '',
      webhook_url: item.webhook_url || null,
      state: item.state,
      is_active: item.is_active,
      message_received: item.message_received || false,
      message_sent: item.message_sent || false,
      qr: item.qr || null,
      qr_loading: item.qr_loading || false,
    }));

    return fetchedSessions;
  };

  // Fetch user sessions using SWR
  const { data: fetchedSessions, error, isLoading: loadingSessions } = useSWR(
    typedSession?.jwt
      ? [
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/instances?filters[users][id][$eq]=${typedSession.id}&populate=*`,
        typedSession.jwt,
      ]
      : null,
    ([url, token]) => fetcher(url, token),
    {
      refreshInterval: 1000, // 1 segundos
    }
  );

  // Update sessions and webhook inputs when fetchedSessions changes
  useEffect(() => {
    if (fetchedSessions) {
      setSessions(fetchedSessions);

      // Initialize webhook inputs
      const initialWebhooks = fetchedSessions.reduce(
        (acc, session) => ({
          ...acc,
          [session.documentId]: session.webhook_url || '',
        }),
        {}
      );
      setWebhookInputs(initialWebhooks);

      // Fetch profile data for connected sessions
      fetchedSessions.forEach((session) => {
        if (session.state === 'Connected') {
          fetchProfileData(session.documentId);
        }
      });
    }
  }, [fetchedSessions]);

  // Handle authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchQrsForDisconnectedSessions = async (documentId: string) => {
    // Filtrar solo la sesión que coincide con el documentId
    const disconnectedSession = sessions.find(
      (session) => session.state === 'Disconnected' && session.is_active && session.documentId === documentId
    );

    // Si no hay sesión válida, salir temprano
    if (!disconnectedSession) {
      console.warn(`No disconnected session found for documentId: ${documentId}`);
      return;
    }

    // Establecer estado de carga para el documentId específico

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/generate-qr`,
        { clientId: documentId },
        { headers: { 'Content-Type': 'application/json' } }
      );


    } catch (err: any) {
      console.error(`Error fetching QR for ${documentId}:`, err.response?.data || err.message);
    } finally {
      setLoadingQrs((prev) => ({ ...prev, [documentId]: false }));
    }
  };


  const createNewInstance = async () => {
    try {
      const postData = {
        data: {
          users: typedSession?.id,
          webhook_url: null,
          is_active: true,
          state: 'Disconnected',
        },
      };
      await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/instances`, postData, {
        headers: {
          Authorization: `Bearer ${typedSession?.jwt}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      console.error('Error al crear la instancia:', error.response?.data || error.message);
    }
  };

  // const deleteInstance = async (documentId: string) => {
  //   if (!confirm('¿Estás seguro de que quieres eliminar esta instancia?')) return;

  //   try {
  //     await axios.delete(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/instances/${documentId}`, {
  //       headers: { Authorization: `Bearer ${typedSession?.jwt}` },
  //     });

  //     await axios.post(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/delete-session/${documentId}`,
  //       {},
  //       {
  //         headers: { 'Content-Type': 'application/json' },
  //       }
  //     );
  //   } catch (error: any) {
  //     console.error('Error al eliminar la instancia:', error.response?.data || error.message);
  //   }
  // };

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

      toast.success('Webhook actualizado con éxito');
    } catch (error: any) {
      console.error('Error al actualizar el webhook:', error.response?.data || error.message);
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
          number: res.data.number,
        },
      }));
    } catch (error: any) {
      console.error(`Error fetching profile for ${documentId}:`, error.response?.data || error.message);
      setProfiles((prev) => ({
        ...prev,
        [documentId]: { name: 'Unknown', profilePicUrl: null, number: null },
      }));
    }
  };

  const toggleInstanceActive = async (documentId: string, currentActiveState: boolean) => {
    try {
      const newActiveState = !currentActiveState;
      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/instances/${documentId}`,
        {
          data: { is_active: newActiveState },
        },
        {
          headers: {
            Authorization: `Bearer ${typedSession?.jwt}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success(`Instancia ${newActiveState ? 'activada' : 'pausada'} con éxito`);
    } catch (error: any) {
      console.error('Error al alternar estado de la instancia:', error.response?.data || error.message);
    }
  };

  const DisconnectInstance = async (documentId: string) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/disconnect-session/${documentId}`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      toast.success('Sesión desconectada con éxito');
    } catch (error: any) {
      console.error('Error al desconectar la instancia:', error.response?.data || error.message);
      toast.error('Error al desconectar la instancia');
    }
  };

  const ConfigInstance = async (documentId: string) => {
    const session = sessions.find((s) => s.documentId === documentId);

    if (session) {
      setWebhookSettings({
        message_received: session.message_received || false,
        message_sent: session.message_sent || false,
      });
      setSelectedDocumentId(documentId);
      setIsModalOpen(true);
    }
  };

  const saveWebhookSettings = async () => {
    if (!selectedDocumentId) return;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/instances/${selectedDocumentId}`,
        {
          data: {
            message_received: webhookSettings.message_received,
            message_sent: webhookSettings.message_sent,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${typedSession?.jwt}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('Configuración de webhook actualizada con éxito');
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error al actualizar configuración de webhook:', error.response?.data || error.message);
      toast.error('Error al actualizar configuración de webhook');
    }
  };
  return (
    <div className="">
      <Toaster richColors position="top-right" />

      <div className="p-5 mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Bienvenido, {username}</h1>

        <div className="mb-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Tus Sesiones</h2>
            <button
              onClick={createNewInstance}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              + Nueva Instancia
            </button>
          </div>

          {error && <p className="text-red-500 mb-4">{error.message || 'Error al cargar las sesiones.'}</p>}

          {loadingSessions ? (
            <p className="text-zinc-400">Cargando sesiones...</p>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
              {sessions.map((session) => (
                <div
                  key={session.documentId}
                  className="bg-zinc-800 rounded-lg shadow-md p-3 border border-zinc-700"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={profiles[session.documentId]?.profilePicUrl ?? '/logo/profile.png'}
                        alt="Profile"
                        className="w-16 h-16 border-4 border-green-500 rounded-full object-cover shadow-lg"
                        onError={(e) => (e.currentTarget.src = '/logo/profile.png')}
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {profiles[session.documentId]?.name || 'Instancia'}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          {profiles[session.documentId]?.number || 'Número no disponible'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${{
                          Initializing: 'bg-yellow-100 text-yellow-800',
                          Connected: 'bg-green-100 text-green-800',
                          Failure: 'bg-orange-100 text-orange-800',
                          Disconnected: 'bg-red-100 text-red-800',
                        }[session.state] || 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {session.state}
                      </span>
                      {session.state === 'Connected' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleInstanceActive(session.documentId, session.is_active)}
                            className={`flex items-center justify-center w-8 h-8 rounded-full transition ${session.is_active
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-gray-600 hover:bg-gray-700 text-white'
                              }`}
                            title={session.is_active ? 'Pausar instancia' : 'Activar instancia'}
                          >
                            {session.is_active ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => DisconnectInstance(session.documentId)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
                            title="Desconectar instancia"
                          >
                            <PowerIcon className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      {/* {session.state === 'Failure' && (
                        <button
                          onClick={() => deleteInstance(session.documentId)}
                          className="text-red-500 hover:text-red-700"
                          title="Eliminar instancia"
                        >
                          <XMarkIcon className="w-5 h-5 font-bold" />
                        </button>
                      )} */}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-zinc-400">
                        <span className="font-bold">ClientId:</span> {session.documentId}
                      </p>
                      {session.state === 'Connected' && (
                        <button
                          onClick={() => ConfigInstance(session.documentId)}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 hover:bg-slate-700 text-white transition"
                          title="Configura tu weebhook"
                        >
                          <Cog6ToothIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-zinc-400 font-medium block mb-1">Webhook:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={webhookInputs[session.documentId] || ''}
                          onChange={(e) => handleWebhookChange(session.documentId, e.target.value)}
                          placeholder="https://ejemplo.com/webhook"
                          className="p-2 w-full text-zinc-400 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          onClick={() => updateWebhook(session.documentId)}
                          className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>



                    {session.state === 'Disconnected' && (





                      <div>






{session.qr ? (
  <>
    <label className="text-zinc-400 font-medium block mb-1">Escanea este QR:</label>
    <img
      src={session.qr}
      alt="WhatsApp QR"
      className="w-32 h-32 mx-auto"
      onError={(e) => console.error('Error al cargar QR:', e)}
    />
    <p className="text-xs text-zinc-400 mt-2 text-center">
      Escanea con WhatsApp / Ajustes / Dispositivos vinculados
    </p>
  </>
) : session.qr_loading ? (
  <div className="flex justify-center items-center">
    <span className="text-zinc-400 text-sm">Generando QR...</span>
    {/* Puedes agregar un spinner animado si lo deseas */}
    <svg className="animate-spin h-5 w-5 ml-2 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>
) : (
  <div className="flex justify-center items-center">
    <button
      onClick={async () => {
        await fetchQrsForDisconnectedSessions(session.documentId);
      }}
      className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition"
    >
      Genera un nuevo QR
    </button>
  </div>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-zinc/40 bg-opacity-50 shadow-md flex items-center justify-center z-50">
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Configurar Webhook</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={webhookSettings.message_received}
                  onChange={(e) =>
                    setWebhookSettings((prev) => ({
                      ...prev,
                      message_received: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <label className="text-zinc-400">Recibir mensajes (message_received)</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={webhookSettings.message_sent}
                  onChange={(e) =>
                    setWebhookSettings((prev) => ({
                      ...prev,
                      message_sent: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                <label className="text-zinc-400">Mensajes enviados (message_sent)</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-zinc-600 text-white px-4 py-2 rounded-md hover:bg-zinc-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={saveWebhookSettings}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                Guardar
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