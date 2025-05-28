// app/api/n8n/create/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const containerName = `n8n-${Date.now()}`;
    const port = 5678 + Math.floor(Math.random() * 1000); // Unique port

    const response = await fetch(`${process.env.NEXT_PUBLIC_EASYPANEL_API_URL}/projects/${process.env.NEXT_PUBLIC_EASYPANEL_PROJECT_ID}/services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_EASYPANEL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: containerName,
        image: 'n8nio/n8n:latest',
        ports: [{ containerPort: 5678, hostPort: port }],
        environment: {
          N8N_HOST: '0.0.0.0',
          N8N_PORT: '5678',
          N8N_PROTOCOL: 'http',
          N8N_BASIC_AUTH_ACTIVE: 'false',
          N8N_LOG_LEVEL: 'error',
          NODE_ENV: 'production',
          N8N_CONCURRENCY: '1',
        },
        resources: {
          memory: '300M',
          cpu: '0.5',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create n8n instance');
    }

    const data = await response.json();
    return NextResponse.json({
      id: containerName,
      port,
      url: `https://${process.env.NEXT_PUBLIC_VPS_IP}:${port}`,
    });
  } catch (error) {
    console.error('Error creating n8n instance:', error);
    return NextResponse.json({ error: 'Failed to create n8n instance' }, { status: 500 });
  }
}