import axios from 'axios';

// /pages/api/resources/use.js


const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WORKSPACE;



export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { users } = req.body;

    if (!users) {
        return res.status(400).json({ error: 'Missing users data' });
    }

    try {
        const response = await axios.post(WEBHOOK_URL, { users });
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({ error: 'Error fetching data' });
    }
}