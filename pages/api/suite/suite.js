import axios from 'axios';

export default async function handler(req, res) {
  const { method, body } = req;
  const webhook = process.env.USE_RESOURCE_WEBHOOK;

  if (!webhook) {
    console.error('USE_RESOURCE_WEBHOOK is not defined');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    if (method === 'POST') {
      if (!body.token || !body.name_service) {
        return res.status(400).json({ error: 'Missing token or name_service in request body' });
      }

      // Send the POST request to the webhook
      const response = await axios.post(
        webhook,
        {
          token: body.token,
          name_service: body.name_service,
        },
        {
          headers: {
        'Content-Type': 'application/json',
          },
        }
      );

   //console.log('Webhook aaaaaaaaaaaaaaaaaaaaaa:', response.data);



      // Normalize the response: wrap single object in an array if needed
      const responseData = Array.isArray(response.data) 
        ? response.data 
        : [response.data];

      // Check if the normalized response has the expected structure
      if (responseData[0]?.result?.data?.json) {
        return res.status(200).json(responseData);
      } else {
        console.warn('Unexpected webhook response structure:', response.data);
        return res.status(400).json({ error: 'Invalid response structure from webhook' });
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