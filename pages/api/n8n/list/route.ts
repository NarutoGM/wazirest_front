// app/api/n8n/list/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_EASYPANEL_API_URL}/projects/${process.env.NEXT_PUBLIC_EASYPANEL_PROJECT_ID}/services`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_EASYPANEL_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to list n8n instances');
    }

    const services = await response.json();
    const n8nServices = services
      .filter((s: any) => s.image.includes('n8n'))
      .map((s: any) => ({
        id: s.name,
        port: s.ports.find((p: any) => p.containerPort === 5678)?.hostPort || null,
        status: s.status || 'unknown',
        url: s.status === 'running' && s.ports.find((p: any) => p.containerPort === 5678)
          ? `http://${process.env.NEXT_PUBLIC_VPS_IP}:${s.ports.find((p: any) => p.containerPort === 5678).hostPort}`
          : null,
      }));

    return NextResponse.json(n8nServices);
  } catch (error) {
    console.error('Error listing n8n instances:', error);
    return NextResponse.json({ error: 'Failed to list n8n instances' }, { status: 500 });
  }
}