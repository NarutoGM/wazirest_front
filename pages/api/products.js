import axios from 'axios';

export default async function handler(req, res) {
  const { method, headers, body, query } = req;
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL; // Server-side env variable
  const token_read = process.env.NEXT_PUBLIC_BACKEND_READ_TOKEN; // Server-side env variable
  const weebhook = process.env.NEXT_PUBLIC_N8N_WORKSPACE;
  

    const weebhook_info = process.env.INFO_SERVICE_WEBHOOK;

  try {
    if (method === 'GET') {
      const response = await axios.get(
        `${STRAPI_URL}/api/products?populate=*`,
        {
          headers: { Authorization: `Bearer ${token_read}` },
        }
      );



      response
      const payload = response.data.data.map(item => ({
        name: item.name,
        fields: item.fields,

        img: `${process.env.NEXT_PUBLIC_STRAPI_URL}${item.img[0].url}`,
      }));
      return res.status(200).json(payload);



    } else if (method === 'POST') {
      // Create new instance
      const response = await axios.post(
        weebhook_info,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { success, message } = response.data;

      if (success) {
        return res.status(200).json({ message });
      } else {
        return res.status(400).json({ message });
      }



    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error',
    });
  }
}