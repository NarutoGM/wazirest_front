import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const webhook = process.env.GET_INFO_USER;
  const { jwt } = req.body;


  
  if (!jwt) {
    return res.status(401).json({ error: 'Token JWT no proporcionado' });
  }

  try {




    const response = await axios.post(webhook, { token: jwt });
    const {
      username,
      email,
      key,
      name_plan: plan,
      num_intances: num_instances,
      cap_ram
    } = response.data;

    return res.status(200).json({
      username,
      email,
      key,
      plan,
      num_instances,
      cap_ram
    });







    
  } catch (error) {
    console.error(
      'Error al obtener la info del usuario:',
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Error interno al obtener usuario',
    });
  }
}
