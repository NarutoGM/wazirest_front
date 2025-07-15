import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { jwt, username, key } = req.body;
  if (!jwt || !username || !key) {
    return res.status(400).json({ error: 'Faltan datos necesarios' });
  }

  const webhook = process.env.UPDATE_INFO_USER;

  if (!jwt) {
    return res.status(401).json({ error: 'Token JWT no proporcionado' });
  }

  try {
    const response = await axios.post(webhook, { token: jwt ,username , key });



    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      'Error al actualizar la info del usuario:',
      error.response?.data || error.message
    );
    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Error interno al actualizar usuario',
    });
  }
}
