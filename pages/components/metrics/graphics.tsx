'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
import type { ChartOptions } from 'chart.js';
import { HistoricalData } from './nav'; // Adjust the import path as necessary

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

interface DashboardContentProps {
  historyData: HistoricalData[];
}

function DashboardContent({ historyData }: DashboardContentProps) {
  const { data: session, status } = useSession();
  const typedSession = session as CustomSession | null;
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      setLoading(false); // Data is now passed as prop, so no fetching is needed
    }
  }, [status, router]);

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

  const chartOptions: ChartOptions<'line'> = {
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
        display: (context) => {
          // Only show data labels when the tooltip is active for the specific data point
          const tooltip = context.chart.tooltip;
          const activeElements = tooltip?.getActiveElements?.();
          if (activeElements && activeElements.length > 0) {
            const activePoint = activeElements[0];
            return (
              activePoint.datasetIndex === context.datasetIndex &&
              activePoint.index === context.dataIndex
            );
          }
          return false;
        },
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
          ? Math.max(
              ...historyData
                .flatMap((data) => [
                  data.message_sent,
                  data.api_message_sent,
                  data.message_received,
                ])
                .filter((value): value is number => typeof value === 'number')
            ) * 1.2
          : 100,
      },
    },
  };

  return (
    <div className="p-4">
      <Toaster richColors position="top-right" />
      {loading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : historyData.length > 0 ? (
        <div className="relative  bg-zinc-800 rounded-2xl p-5 w-full max-w-4xl mx-auto h-[500px] box-border overflow-x-auto">
          <Line data={chartData} options={chartOptions} />
        </div>
      ) : (
        <p className="text-zinc-400">No historical data available.</p>
      )}
    </div>
  );
}

export default function Dashboard({ historyData }: DashboardContentProps) {
  return <DashboardContent historyData={historyData} />;
}