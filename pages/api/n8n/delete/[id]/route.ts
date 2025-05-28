// app/api/n8n/delete/[id]/route.ts
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_EASYPANEL_API_URL}/services/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_EASYPANEL_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete n8n instance');
    }

    return NextResponse.json({ message: `n8n instance ${params.id} deleted` });
  } catch (error) {
    console.error('Error deleting n8n instance:', error);
    return NextResponse.json({ error: 'Failed to delete n8n instance' }, { status: 500 });
  }
}