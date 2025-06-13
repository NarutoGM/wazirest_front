'use client';
import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebard from '../components/dashboard/index';
import { Toaster, toast } from 'sonner';
import useSWR from 'swr';

interface CustomSession {
  id?: string;
  firstName?: string;
  username?: string;
}

interface WorkspaceStruture {
  id: number;
  documentId: string;
  name?: string | null;
  fields?: string | null;
  url?: string | null;
  security?: string | null;
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
      fields: item.fields || '',
      url: item.url || '',
      security: item.security || '',
    }));

    console.log('Datos obtenidos:', data);

    return fetchedWorkspaces;
  };

  // Fetch user sessions using SWR
  const { data: fetchedWorkspaces, error, isLoading: loadingSessions } = useSWR(
    typedSession?.id
      ? `/api/workspaces?userId=${typedSession.id}`
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



  return (
    <div className=" ">
      <Toaster richColors position="top-right" />

      <div className="flex">
        <div className="p-5 mx-auto w-full">
          <h1 className="text-2xl font-bold text-white mb-6">Bienvenido, {username}</h1>

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
                      <div className="flex justify-between items-center">
                        <p className="text-zinc-400">
                          <span className="font-bold">Nombre:</span> {workspaces.name}
                        </p>
                        <p className="text-zinc-400">
                          <span className="font-bold">ClientId:</span> {workspaces.documentId}
                        </p>
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