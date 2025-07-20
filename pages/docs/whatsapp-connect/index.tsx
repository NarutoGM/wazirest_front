'use client';
import Sidebard from '../../components/docs/index';

export default function Docs() {
  return (
    <Sidebard>
      <div className="p-8 pb-84 max-w-4xl mx-auto text-white">




        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Conecta tu WhatsApp</h2>
          <p className="mb-6 text-zinc-300">
            En esta sección te explicamos los pasos a seguir para conectarte y utilizar la API de WhatsApp:
          </p>
          <ol className="list-decimal list-inside space-y-4 text-zinc-300">
            <li>
              <strong>Paso 1:</strong> Tener una cuenta en{' '}
              <a
                href="https://app.wazilrest.com/register"
                className="text-emerald-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
https://app.wazilrest.com/register

              </a>
            </li>
            <li>
              <strong>Paso 2:</strong> Haz clic en el botón “Acceder” en tu instancia.
            </li>
            <li>
              <strong>Paso 3:</strong> Accederás a tu panel de configuración. Haz clic en el botón “Mostrar QR”, que generará un código QR. Escanea este QR desde tu WhatsApp en la sección “Vincular dispositivos” (similar a cuando vinculas WhatsApp Web).
            </li>
            <li>
              <strong>Paso 4:</strong> Si la conexión fue exitosa, aparecerá el mensaje “Tu número de WhatsApp conectado” como se muestra en la imagen a continuación.
            </li>
          </ol>


          <div className="mt-4">
            <p className="text-zinc-400 italic">
            </p>
          </div>


        </section>
      </div>
    </Sidebard>
  );
}