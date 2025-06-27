import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const webhook = process.env.PAUSE_INIT_WEBHOOK;
  const { token, name_service } = req.body;

  if (!token || !name_service) {
    return res.status(400).json({ message: 'Missing token or name_service' });
  }

  try {
    // Aquí puedes hacer lo que necesites, por ejemplo, llamar a un webhook externo
    const response = await axios.post(webhook, { token, name_service, type: 'init' });


      const { success, message } = response.data;

      if (success) {
        return res.status(200).json({ message });
      } else {
        return res.status(400).json({ message });
      }





    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    return res.status(500).json({ message: 'Error processing request', error: error.message });
  }
}