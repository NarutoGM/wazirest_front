import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const resp = await axios.post(
      'https://sandbox-api.izipay.pe/v1/session_tokens', // endpoint sandbox
      {
        merchantId: process.env.IZIPAY_MERCHANT_ID,
        amount: '0', // para registrar tarjeta sin pago
        currency: 'USD',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${process.env.IZIPAY_API_KEY}:`).toString('base64')}`
        }
      }
    );

    const { tokenSession, keyRSA } = resp.data;
    res.status(200).json({ tokenSession, keyRSA });
  } catch (err: any) {
    console.error('izipay session error', err.response?.data || err.message);
    res.status(500).json({ error: 'Error generating session token' });
  }
}
