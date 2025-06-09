import axios from 'axios';

export default async function handler(req, res) {
  const { method, query } = req;
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL; // Server-side env variable
  const token_read = process.env.NEXT_PUBLIC_BACKEND_READ_TOKEN; // Server-side env variable

  try {
    if (method === 'GET') {
      // Fetch user-specific workspaces
      const response = await axios.get(
        `${STRAPI_URL}/api/workspaces?filters[user][id][$eq]=${query.userId}&sort=id:desc`,
        {
          headers: { Authorization: `Bearer ${token_read}` },
        }
      );
      return res.status(200).json(response.data);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error',
    });
  }
}