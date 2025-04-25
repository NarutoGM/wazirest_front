'use client';
import { SessionProvider, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Sidebard from '../components/dashboard/index';
import { Toaster } from 'sonner';
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
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the plugin

// Register Chart.js components and the data labels plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // Register the plugin
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
  const [historyData, setHistoryData] = useState<any[]>([]);
  const typedSession = session as CustomSession | null;
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchUserSessions();
    }
  }, [status, router]);

  const fetchUserSessions = async () => {
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

      if (fetchedSessions.length > 0) {
        setHistoryData(fetchedSessions[0].historycal_data);
      }
    } catch (error) {
      console.error('Error fetching user sessions:', error);
    }
  };

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
        enabled: true, // Keep tooltips enabled
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
        align: 'top' as const, // Position labels above the points
        formatter: (value: number, context: any) => {
          const datasetLabel = context.dataset.label || '';
          return `${value}`; // Show only the value
          // Optionally include the label: `${datasetLabel}: ${value}`
        },
        color: '#ffff', // Label color
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
      {historyData.length > 0 ? (
        <div className="relative w-full max-w-4xl mx-auto h-[500px] box-border overflow-x-auto">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p>Loading data...</p>
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