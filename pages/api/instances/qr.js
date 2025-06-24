import axios from 'axios';

export default async function handler(req, res) {
    const { method, headers, body, query } = req;
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL; // Server-side env variable

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // Server-side env variable


  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { clientId } = req.body;


  const  token  = headers.token;


      
      const user = await axios.get(
        `${STRAPI_URL}/api/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (user.data.status_plan=== false) {
        return res.status(400).json({ message: 'No tienes un plan activo' });
      }



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