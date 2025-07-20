'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Graphics from '../../pages/components/metrics/graphics';
import { SessionProvider,useSession } from 'next-auth/react';
import Sidebard from '../components/dashboard/index';

interface CustomSession {
  id?: string;
  jwt?: string;
  firstName?: string;
}

export interface HistoricalData {
  date: string;
  message_sent?: number;
  api_message_sent?: number;
  message_received?: number;
}

interface WhatsAppSession {
  id: number;
  documentId: string;
  user: string;
  is_active: boolean;
  state: string;
  historycal_data: HistoricalData[]; 
  name?: string;
  profilePicUrl?: string | null;
  number?: string | null;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const typedSession = session as CustomSession | null;
  const router = useRouter();
  const [instances, setInstances] = useState<WhatsAppSession[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('all'); // Default to 'all'
  const [historyData, setHistoryData] = useState<HistoricalData[]>([]);
  const [profiles, setProfiles] = useState<{
    [key: string]: { name?: string; profilePicUrl?: string; number?: string };
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);

useEffect(() => {
    const fetchUserInfo = async () => {
        try {
            const response = await axios.post('/api/user/get', {
                jwt: typedSession?.jwt,
            });
            setUser(response.data);



             console.log('User info:', response.data);
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    if (typedSession?.jwt) {
        fetchUserInfo();
    }
}, [typedSession?.jwt]);




  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchUserSessions();
    }
  }, [status, router]);

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
      const res = await axios.get(`/api/instances?token=${typedSession?.jwt}`);

      const fetchedSessions: WhatsAppSession[] = res.data.instances.map((item: WhatsAppSession) => ({
        id: item.id,
        documentId: item.documentId,
        state: item.state,
        historycal_data: item.historycal_data || [],
      }));

      setInstances(fetchedSessions);

      const allData = fetchedSessions.reduce<HistoricalData[]>(
        (acc, instance) => [...acc, ...instance.historycal_data],
        []
      );
      setHistoryData(allData);

      fetchedSessions.forEach((session) => {
        if (session.state === 'Connected') {
          fetchProfileData(session.documentId);
        }
      });
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      toast.error('Failed to fetch instances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileData = async (documentId: string) => {
    try {
      const res = await axios.get(`/api/instances/profile/${documentId}`, {
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
        [documentId]: { name: ' ', profilePicUrl: ' ', number: ' ' },
      }));
    }
  };

  const handleInstanceSelect = (documentId: string) => {
    if (documentId === 'all') {
      setSelectedInstanceId('all');
      const allData = instances.reduce<HistoricalData[]>(
        (acc, instance) => [...acc, ...instance.historycal_data],
        []
      );
      setHistoryData(allData);
    } else {
      setSelectedInstanceId(documentId);
      const selectedInstance = instances.find((instance) => instance.documentId === documentId);
      setHistoryData(selectedInstance?.historycal_data || []);
    }
    setIsDropdownOpen(false);
  };

  const selectedInstance = instances.find((instance) => instance.documentId === selectedInstanceId);
  const selectedProfile = selectedInstance ? profiles[selectedInstance.documentId] : null;

  // Parse date and group data by month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth(); // 0-11, July is 6
  const currentYear = currentDate.getFullYear();

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day); // month is 0-based in JS
  };

  const getMonthData = (data: any[], month: number, year: number) => {
    return data
      .filter((data) => {
        const dataDate = parseDate(data.date);
        return dataDate.getMonth() === month && dataDate.getFullYear() === year;
      })
      .reduce(
        (acc, curr) => ({
          api_message_sent: (acc.api_message_sent || 0) + (curr.api_message_sent || 0),
          message_sent: (acc.message_sent || 0) + (curr.message_sent || 0),
          message_received: (acc.message_received || 0) + (curr.message_received || 0),
        }),
        { api_message_sent: 0, message_sent: 0, message_received: 0 }
      );
  };

  const currentMonthData = getMonthData(historyData, currentMonth, currentYear);
  const previousMonthData = getMonthData(historyData, currentMonth === 0 ? 11 : currentMonth - 1, currentMonth === 0 ? currentYear - 1 : currentYear);

  // Calculate percentage change
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
  };

  const apiChange = calculatePercentageChange(currentMonthData.api_message_sent, previousMonthData.api_message_sent || 0);
  const sentChange = calculatePercentageChange(currentMonthData.message_sent, previousMonthData.message_sent || 0);
  const receivedChange = calculatePercentageChange(currentMonthData.message_received, previousMonthData.message_received || 0);

  return (
    <div className="p-4 bg-zinc-900">
      <Toaster richColors position="top-right" />
      {loading ? (
        <p className="text-zinc-400">Loading instances...</p>
      ) : instances.length === 0 ? (
        <p className="text-zinc-400">No instances available. Please create a new instance.</p>
      ) : (
        <>
          <div className="mb-4 ">
            <label className="text-white mb-2 block">Select Instance:</label>
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center justify-between p-3 bg-zinc-800  rounded-lg cursor-pointer hover:bg-zinc-700/80 transition"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex items-center gap-3">
                  {selectedInstanceId === 'all' ? (
                    <span className="text-white">All</span>
                  ) : selectedInstance?.state === 'Connected' && selectedProfile?.profilePicUrl ? (
                    <img
                      src={selectedProfile.profilePicUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-green-500"
                      onError={(e) => (e.currentTarget.src = '/default-profile.png')}
                    />
                  ) : null}
                  <span className="text-white">
                    {selectedInstanceId === 'all' ? 'All' : selectedInstance?.documentId || 'Select an instance'}{' '}
                    {selectedInstance?.state === 'Connected' && selectedProfile?.name && selectedInstanceId !== 'all'
                      ? `(${selectedProfile.name} - ${selectedProfile.number})`
                      : ''}
                  </span>
                </div>
                <ChevronDownIcon
                  className={`w-5 h-5 text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>
              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 w-full bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div
                    key="all"
                    className="flex items-center gap-3 p-3 hover:bg-zinc-700 cursor-pointer transition"
                    onClick={() => handleInstanceSelect('all')}
                  >
                    <span className="text-white">All</span>
                  </div>
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
                            <span className="text-zinc-400 text-sm block">{profile.name} - {profile.number}</span>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-zinc-800   p-5 rounded-xl shadow flex flex-col items-start">
                <h3 className="text-zinc-300 text-sm font-medium mb-2">Mensajes API (Mes)</h3>
                <p className="text-3xl text-white font-extrabold mb-1">{currentMonthData.api_message_sent || 0}</p>
                <span className="text-emerald-400 text-xs font-semibold">{apiChange} vs mes anterior</span>
              </div>
              <div className="bg-zinc-800   p-5 rounded-xl shadow flex flex-col items-start">
                <h3 className="text-zinc-300 text-sm font-medium mb-2">Mensajes Enviados</h3>
                <p className="text-3xl text-white font-extrabold mb-1">{currentMonthData.message_sent || 0}</p>
                <span className="text-emerald-400 text-xs font-semibold">{sentChange} vs mes anterior</span>
              </div>
              <div className="bg-zinc-800   p-5 rounded-xl shadow flex flex-col items-start">
                <h3 className="text-zinc-300 text-sm font-medium mb-2">Mensajes Recibidos</h3>
                <p className="text-3xl text-white font-extrabold mb-1">{currentMonthData.message_received || 0}</p>
                <span className="text-emerald-400 text-xs font-semibold">{receivedChange} vs mes anterior</span>
              </div>
              <div className="bg-zinc-800   p-5 rounded-xl shadow flex flex-col items-start">
                <h3 className="text-zinc-300 text-sm font-medium mb-2">Instancias Totales</h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl text-white font-extrabold">{instances?.length || 0}</span>
                  <span className="text-xs text-zinc-400">/ {user?.num_instances || 0}</span>
                </div>
                <span className="text-cyan-400 text-xs font-semibold">{user?.plan || 'Sin plan'}</span>
              </div>
            </div>


           <Graphics historyData={historyData} />

        </>
      )}
    </div>
  );
}
export default function Dashboard() {
  return (


          <Sidebard>
      <DashboardContent/>
          </Sidebard >

  );
}