// pages/api/instances.js
import axios from 'axios';

export default async function handler(req, res) {
  const { method, headers, body, query } = req;
  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL; // Server-side env variable
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL; // Server-side env variable

  const token_read = process.env.NEXT_PUBLIC_BACKEND_READ_TOKEN; // Server-side env variable
  const token_update = process.env.NEXT_PUBLIC_BACKEND_UPDATE_INSTANCE_TOKEN; // Server-side env variable

  try {
    if (method === 'GET') {



      // Fetch sessions
      const response = await axios.get(

        `${STRAPI_URL}/api/instances?filters[user][id][$eq]=${query.userId}&sort=id:desc`,
        {
          headers: { Authorization: `Bearer ${token_read}` },
        }
      );
      return res.status(200).json(response.data);



    } else if (method === 'POST') {
      // Create new instance
      const response = await axios.post(
        process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return res.status(200).json(response.data);
    } else if (method === 'PUT') {
      // Update webhook or instance
      const { documentId } = query;
      const response = await axios.put(
        `${STRAPI_URL}/api/instances/${documentId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token_update}`,
            'Content-Type': 'application/json',
          },
        }
      );


      // Extraer webhook_url correctamente del body
      const webhookUrl = body.data.webhook_url;

      console.log("probando" + webhookUrl)
      if (webhookUrl === undefined) {
        return res.status(200).json(response.data);
      } else {

        await axios.post(
          `${BACKEND_URL}/api/update-weebhook/${documentId}`,
          { webhook_url: webhookUrl },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        return res.status(200).json(response.data);


      }


    }
    // Add other methods (DELETE, etc.) as needed
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Internal Server Error',
    });
  }
}

// const deleteInstance = async (documentId: string) => {
//   if (!confirm('¿Estás seguro de que quieres eliminar esta instancia?')) return;

//   try {
//     await axios.delete(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/instances/${documentId}`, {
//       headers: { Authorization: `Bearer ${typedSession?.jwt}` },
//     });

//     await axios.post(
//       `${process.env.BACKEND_URL}/api/delete-session/${documentId}`,
//       {},
//       {
//         headers: { 'Content-Type': 'application/json' },
//       }
//     );
//   } catch (error: any) {
//     console.error('Error al eliminar la instancia:', error.response?.data || error.message);
//   }
// };