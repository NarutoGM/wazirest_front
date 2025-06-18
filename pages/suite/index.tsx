'use client';
import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebard from '../components/dashboard/index';
import { Toaster, toast } from 'sonner';
import useSWR from 'swr';
import { ArrowTopRightOnSquareIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

interface CustomSession {
  id?: string;
  firstName?: string;
  username?: string;
}

interface WorkspaceStruture {
  id: number;
  documentId: string;
  name?: string | null;
  url?: string | null;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const username = (session as CustomSession | null)?.username;
  const typedSession = session as CustomSession | null;
  const router = useRouter();
  const [workspace, setWorkspaceStruture] = useState<WorkspaceStruture[]>([]);

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

    // Transform the response data into WorkspaceStruture format
    const fetchedWorkspaces: WorkspaceStruture[] = data.data.map((item: any) => ({
      id: item.id,
      documentId: item.documentId,
      name: item.name || null,
      url: item.url || '',
    }));

    console.log('Datos obtenidos:', data);

    return fetchedWorkspaces;
  };

  // Fetch user sessions using SWR
  const { data: fetchedWorkspaces, error, isLoading: loadingSessions } = useSWR(
    typedSession?.id
      ? `/api/suite?userId=${typedSession.id}`
      : null,
    (url) => fetcher(url, ''),
    {
      refreshInterval: 5000,
    }
  );

  useEffect(() => {
    if (fetchedWorkspaces) {
      setWorkspaceStruture(fetchedWorkspaces);
    }
  }, [fetchedWorkspaces]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const createNewWorkSpace = async () => {
    try {
      await axios.post(
        '/api/suite',
        { users: typedSession?.id },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('Nueva instancia creada con éxito');
    } catch (error: any) {
      console.error('Error al crear nueva instancia:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Error al crear nueva instancia');
    }

  };

  return (
    <div className=" ">
      <Toaster richColors position="top-right" />

      <div className="flex">
        <div className="p-5 mx-auto w-full">
          <h1 className="text-2xl font-bold text-white mb-6">Bienvenido, {username}</h1>


          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Tu Suite 😎😎</h2>
            {workspace.length === 0 ? (
              <button
                onClick={createNewWorkSpace}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition"
              >
                <SparklesIcon className="w-5 h-5" />
                Prueba de n8n gratis por 7 días
              </button>
            ) : (
              <button
                onClick={createNewWorkSpace}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition"
              >
                <PlusIcon className="w-5 h-5" />

                Nueva Instancia
              </button>
            )}

          </div>




          <div className="mb-5">


            {error && <p className="text-red-500 mb-4">{error.message || 'Error al cargar las sesiones.'}</p>}

            {loadingSessions ? (
              <p className="text-zinc-400">Cargando sesiones...</p>
            ) : workspace.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
                {workspace.map((workspaces) => (
                  <div
                  key={workspaces.documentId}
                  className="bg-zinc-900/50 rounded-lg shadow-md shadow-cyan-800 p-3 border border-zinc-700"
                  >
                    <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-zinc-400">
                      <span className="font-bold">Nombre:</span> {workspaces.name || 'Sin nombre'}
                      </p>
                      <p className="text-zinc-400">
                      <span className="font-bold">ClientId:</span> {workspaces.documentId}
                      </p>
                      <div className="flex items-center gap-2">
                      <span className="text-zinc-400 font-bold">url:</span>
                      {workspaces.url ? (
                        <a
                        href={workspaces.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-600"
                        title="Abrir"
                        >
                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                        </a>
                      ) : (
                        <span className="text-zinc-500">No disponible</span>
                      )}
                      </div>
                    </div>
                    </div>
                  </div>
                ))}
                </div>
            ) : (
              <p className="text-zinc-400">No tienes sesiones aún. Crea una nueva instancia.</p>
            )}
          </div>

          <div>
            <p className="text-zinc-400 mt-4">
              Si tienes dudas de cómo usar la herramienta, consulta nuestra documentación para utilizar la API.
            </p>
          </div>
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