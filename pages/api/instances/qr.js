import axios from 'axios';

export default async function handler(req, res) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // Server-side env variable


  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clientId } = req.body;


  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/generate-qr`,
      { clientId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error generating QR:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error',
    });
  }
}