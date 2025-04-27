'use client';
import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Sidebard from '../components/dashboard/index';
import { Toaster, toast } from 'sonner';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

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
  historycal_data: {
    date: string;
    message_sent: number;
    api_message_sent: number;
    message_received: number;
  }[];
  name?: string;
  profilePicUrl?: string | null;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const typedSession = session as CustomSession | null;
  const router = useRouter();
  const [instances, setInstances] = useState<WhatsAppSession[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<{
    [key: string]: { name?: string; profilePicUrl?: string | null };
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchUserSessions();
    }
  }, [status, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserSessions = async () => {
    setLoading(true);
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
        state: item.state,
        is_active: item.is_active,
        historycal_data: item.historycal_data || [],
      }));

      setInstances(fetchedSessions);

      // Fetch profile data for connected instances
      fetchedSessions.forEach((session) => {
        if (session.state === 'Connected') {
          fetchProfileData(session.documentId);
        }
      });

      // Set default selected instance
      if (fetchedSessions.length > 0) {
        setSelectedInstanceId(fetchedSessions[0].documentId);
        setHistoryData(fetchedSessions[0].historycal_data || []);
      }
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      toast.error('Failed to fetch instances. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const handleInstanceSelect = (documentId: string) => {
    setSelectedInstanceId(documentId);
    const selectedInstance = instances.find((instance) => instance.documentId === documentId);
    setHistoryData(selectedInstance?.historycal_data || []);
    setIsDropdownOpen(false);
  };

  // Get the selected instance and profile
  const selectedInstance = instances.find((instance) => instance.documentId === selectedInstanceId);
  const selectedProfile = selectedInstance ? profiles[selectedInstance.documentId] : null;

  const chartData = {
    labels: historyData.map((data) => data.date),
    datasets: [
      {
        label: 'Messages Sent',
        data: historyData.map((data) => data.message_sent),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
      {
        label: 'API Messages Sent',
        data: historyData.map((data) => data.api_message_sent),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Messages Received',
        data: historyData.map((data) => data.message_received),
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    interaction: {
      mode: 'nearest',
      intersect: true,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Historical Data',
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            return `${datasetLabel}: ${value}`;
          },
        },
      },
      datalabels: {
        display: true,
        align: 'top' as const,
        formatter: (value: number) => `${value}`,
        color: '#ffff',
        font: {
          weight: 'bold' as const,
          size: 12,
        },
      },
    },
    scales: {
      x: {
        min: 0,
        max: historyData.length > 0 ? historyData.length - 1 : 0,
      },
      y: {
        min: 0,
        max: historyData.length > 0
          ? Math.max(...historyData.flatMap((data) => [
              data.message_sent,
              data.api_message_sent,
              data.message_received,
            ])) * 1.2
          : 100,
      },
    },
  };

  return (
    <div className="p-4">
      <Toaster richColors position="top-right" />
      {loading ? (
        <p className="text-zinc-400">Loading instances...</p>
      ) : instances.length === 0 ? (
        <p className="text-zinc-400">No instances available. Please create a new instance.</p>
      ) : (
        <>
          <div className="mb-4">
            <label className="text-white mb-2 block">Select Instance:</label>
            <div className="relative" ref={dropdownRef}>
              {/* Dropdown Trigger */}
              <div
                className="flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-700 transition"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex items-center gap-3">
                  {selectedInstance?.state === 'Connected' && selectedProfile?.profilePicUrl && (
                    <img
                      src={selectedProfile.profilePicUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-green-500"
                      onError={(e) => (e.currentTarget.src = '/default-profile.png')}
                    />
                  )}
                  <span className="text-white">
                    {selectedInstance?.documentId || 'Select an instance'}{' '}
                    {selectedInstance?.state === 'Connected' && selectedProfile?.name
                      ? `(${selectedProfile.name})`
                      : ''}
                  </span>
                </div>
                <ChevronDownIcon
                  className={`w-5 h-5 text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {instances.map((instance) => {
                    const profile = profiles[instance.documentId];
                    return (
                      <div
                        key={instance.documentId}
                        className="flex items-center gap-3 p-3 hover:bg-zinc-700 cursor-pointer transition"
                        onClick={() => handleInstanceSelect(instance.documentId)}
                      >
                        {instance.state === 'Connected' && profile?.profilePicUrl && (
                          <img
                            src={profile.profilePicUrl}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover border-2 border-green-500"
                            onError={(e) => (e.currentTarget.src = '/default-profile.png')}
                          />
                        )}
                        <div>
                          <span className="text-white">{instance.documentId}</span>
                          {instance.state === 'Connected' && profile?.name && (
                            <span className="text-zinc-400 text-sm block">{profile.name}</span>
                          )}
                        </div>
                        <span
                          className={`ml-auto text-xs px-2 py-1 rounded-full ${
                            instance.state === 'Connected'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {instance.state}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          {historyData.length > 0 ? (
            <div className="relative w-full max-w-4xl mx-auto h-[500px] box-border overflow-x-auto">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <p className="text-zinc-400">No historical data available for this instance.</p>
          )}
        </>
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