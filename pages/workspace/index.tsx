// app/dashboard/page.tsx (unchanged)
'use client';
import { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/index';

interface N8nInstance {
  id: string;
  port: number | null;
  status: string;
  url: string | null;
}

function DashboardContent() {
  const [instances, setInstances] = useState<N8nInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/n8n/list');
      const data = await res.json();
      if (res.ok) {
        setInstances(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch instances');
    } finally {
      setLoading(false);
    }
  };

  const createInstance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/n8n/create', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setInstances([...instances, data]);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create instance');
    } finally {
      setLoading(false);
    }
  };

  const deleteInstance = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/n8n/delete/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setInstances(instances.filter((instance) => instance.id !== id));
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to delete instance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">n8n Instance Manager</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        onClick={createInstance}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 mb-4"
      >
        {loading ? 'Creating...' : 'Create n8n Instance'}
      </button>
      {loading && <p>Loading...</p>}
      <div className="grid gap-4">
        {instances.length === 0 ? (
          <p>No n8n instances found.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">ID</th>
                <th className="border p-2">Port</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">URL</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instances.map((instance) => (
                <tr key={instance.id} className="border">
                  <td className="border p-2">{instance.id}</td>
                  <td className="border p-2">{instance.port || 'N/A'}</td>
                  <td className="border p-2">{instance.status}</td>
                  <td className="border p-2">
                    {instance.url ? (
                      <a href={instance.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        {instance.url}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => deleteInstance(instance.id)}
                      disabled={loading}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:bg-gray-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Sidebar>
      <DashboardContent />
    </Sidebar>
  );
}