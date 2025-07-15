'use client';

import { useState } from 'react';
import Sidebard from '../components/dashboard/index';


 function Pagar() {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(5000); // en centavos
  const [formToken, setFormToken] = useState(null);

  const handleSubmit = async (e:any) => {
    e.preventDefault();

    const res = await fetch('/api/form-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount }),
    });

    const data = await res.json();
    setFormToken(data.formToken);
  };

  return (
    <div className="p-4">
      {!formToken ? (
        <form onSubmit={handleSubmit}>
          <label>
            Email del cliente:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border p-2 m-2"
            />
          </label>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2">
            Generar formulario de pago
          </button>
        </form>
      ) : (
        <>
          <script
            src="https://api.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
            data-kr-public-key="TU_PUBLIC_KEY"
            data-kr-post-url-success="/success"
          ></script>

          <form
            action="/success"
            className="kr-payment-form"
            data-kr-form-token={formToken}
          >
            <div className="kr-pan"></div>
            <div className="kr-expiry"></div>
            <div className="kr-security-code"></div>
            <div className="kr-email"></div>
            <button className="kr-payment-button">Pagar</button>
            <div className="kr-form-error"></div>
          </form>
        </>
      )}
    </div>
  );
}


export default function Dashboard() {
  return (
    <Sidebard>
      <Pagar />
    </Sidebard>
  );
}
