'use client';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Sidebard from '../../components/docs/index';

const ENDPOINT_URL = 'https://api.wazilrest.com/api/send-image/{ClientId}';

export default function Docs() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(ENDPOINT_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Sidebard>
      <div className="p-8 pb-49 max-w-4xl mx-auto text-white">
        <section className="mt-8">
          <h2 className="text-3xl font-semibold mb-4">Enviar una imagen</h2>
          <p className="mb-6 text-zinc-300">
            Para enviar una imagen a través de la API, realiza una petición <strong>POST</strong> al siguiente endpoint:
          </p>
          <div className="relative mb-4">
            <pre className="bg-zinc-800 rounded p-4 text-emerald-400 overflow-x-auto pr-14">
              {`POST ${ENDPOINT_URL}`}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 px-2 py-1 rounded transition"
              aria-label="Copiar URL"
              type="button"
            >
              <ClipboardIcon className="h-5 w-5" />
              <span className="text-xs">{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          <p className="mb-2 text-zinc-300">
            <strong>Parámetros:</strong>
          </p>
          <ul className="list-disc list-inside mb-4 text-zinc-300">
            <li>
              <strong>ClientId</strong> (en la URL): El identificador de tu instancia.
            </li>
            <li>
              <strong>Authorization</strong> (header): <code>Bearer [tu secret key]</code>
            </li>
          </ul>
          <p className="mb-2 text-zinc-300">
            <strong>Body (form-data):</strong>
          </p>
          <pre className="bg-zinc-800 rounded p-4 text-emerald-400 overflow-x-auto mb-4">
            {`number: 521XXXXXXXXXX
message: Tu mensaje opcional
file: [archivo de imagen] (opcional, tipo file)
file: [URL de imagen] (opcional, tipo string)`}
          </pre>
          <p className="text-zinc-400 italic mb-2">
            Debes enviar <strong>file</strong> como archivo o como URL (uno de los dos). El número debe incluir el código de país y no tener espacios ni guiones.
          </p>
          <p className="text-zinc-400 italic">
            El campo <strong>message</strong> es opcional y se usará como pie de foto.
          </p>
        </section>
      </div>
    </Sidebard>
  );
}